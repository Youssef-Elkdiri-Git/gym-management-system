
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using GymManagementApi.Data;
using GymManagementApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RegistrationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RegistrationsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/registrations
        [HttpGet]
        public async Task<IActionResult> GetRegistrations()
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized("Invalid user identity.");

            var query = _context.Registrations.AsQueryable();

            // Admin can see all registrations
            if (!User.IsInRole("Admin"))
            {
                query = query.Where(r => r.UserId == userId);
            }

            var registrations = await query
                .Select(r => new
                {
                    r.Id,
                    r.UserId,
                    r.ScheduleId,
                    r.RegistrationDate,
                    r.Status
                })
                .ToListAsync();

            return Ok(registrations);
        }

        // GET: api/registrations/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRegistration(int id)
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized("Invalid user identity.");

            var registration = await _context.Registrations
                .Where(r => r.Id == id)
                .Select(r => new
                {
                    r.Id,
                    r.UserId,
                    r.ScheduleId,
                    r.RegistrationDate,
                    r.Status
                })
                .FirstOrDefaultAsync();

            if (registration == null)
                return NotFound();

            if (registration.UserId != userId &&
                !User.IsInRole("Admin"))
            {
                return NotFound();
            }

            return Ok(registration);
        }

        // POST: api/registrations
        [HttpPost]
        public async Task<IActionResult> CreateRegistration(
            RegistrationRequest request)
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized("Invalid user identity.");

            var userExists = await _context.Users
                .AnyAsync(u => u.Id == userId);

            if (!userExists)
                return Unauthorized("User does not exist.");

            var schedule = await _context.Schedules
                .FindAsync(request.ScheduleId);

            if (schedule == null)
                return BadRequest("Schedule does not exist.");

            var alreadyRegistered = await _context.Registrations
                .AnyAsync(r =>
                    r.UserId == userId &&
                    r.ScheduleId == request.ScheduleId);

            if (alreadyRegistered)
                return Conflict("User already registered.");

            var currentCount = await _context.Registrations
                .CountAsync(r =>
                    r.ScheduleId == request.ScheduleId &&
                    r.Status == "Active");

            if (currentCount >= schedule.Capacity)
                return Conflict("Schedule is full.");

            var registration = new Registration
            {
                UserId = userId,
                ScheduleId = request.ScheduleId,
                RegistrationDate = DateTime.UtcNow,
                Status = "Active"
            };

            _context.Registrations.Add(registration);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict(
                    "Registration could not be created. It may already exist."
                );
            }

            return CreatedAtAction(
                nameof(GetRegistration),
                new { id = registration.Id },
                new { registration.Id }
            );
        }

        // DELETE: api/registrations/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRegistration(int id)
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized("Invalid user identity.");

            var registration = await _context.Registrations
                .FindAsync(id);

            if (registration == null)
                return NotFound();

            if (registration.UserId != userId &&
                !User.IsInRole("Admin"))
            {
                return NotFound();
            }

            _context.Registrations.Remove(registration);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Read UserId from JWT
        private bool TryGetUserId(out int userId)
        {
            var userIdText = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            return int.TryParse(userIdText, out userId);
        }
    }

    public class RegistrationRequest
    {
        [Range(1, int.MaxValue)]
        public int ScheduleId { get; set; }
    }
}
