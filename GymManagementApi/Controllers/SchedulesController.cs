
using GymManagementApi.Data;
using GymManagementApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace GymManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SchedulesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SchedulesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/schedules
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetSchedules()
        {
            var schedules = await _context.Schedules
                .Select(s => new
                {
                    s.Id,
                    s.SportId,
                    SportName = s.Sport.Name,
                    s.DayOfWeek,
                    s.StartTime,
                    s.EndTime,
                    s.Capacity
                })
                .ToListAsync();

            return Ok(schedules);
        }

        // GET: api/schedules/1
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetScheduleById(int id)
        {
            var schedule = await _context.Schedules
                .Where(s => s.Id == id)
                .Select(s => new
                {
                    s.Id,
                    s.SportId,
                    SportName = s.Sport.Name,
                    s.DayOfWeek,
                    s.StartTime,
                    s.EndTime,
                    s.Capacity
                })
                .FirstOrDefaultAsync();

            if (schedule == null)
                return NotFound("Séance introuvable.");

            return Ok(schedule);
        }

        // POST: api/schedules
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateSchedule(
            [FromBody] ScheduleRequest request)
        {
            if (!TryValidateSchedule(
                request,
                out var day,
                out var start,
                out var end,
                out var error))
            {
                return BadRequest(error);
            }

            bool sportExists = await _context.Sports
                .AnyAsync(s => s.Id == request.SportId);

            if (!sportExists)
                return BadRequest("Le sport n'existe pas.");

            var schedule = new Schedule
            {
                SportId = request.SportId,
                DayOfWeek = day,
                StartTime = start,
                EndTime = end,
                Capacity = request.Capacity
            };

            _context.Schedules.Add(schedule);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetScheduleById),
                new { id = schedule.Id },
                new { schedule.Id }
            );
        }

        // PUT: api/schedules/1
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSchedule(
            int id,
            [FromBody] ScheduleRequest request)
        {
            if (!TryValidateSchedule(
                request,
                out var day,
                out var start,
                out var end,
                out var error))
            {
                return BadRequest(error);
            }

            var schedule = await _context.Schedules
                .FindAsync(id);

            if (schedule == null)
                return NotFound("Séance introuvable.");

            bool sportExists = await _context.Sports
                .AnyAsync(s => s.Id == request.SportId);

            if (!sportExists)
                return BadRequest("Le sport n'existe pas.");

            schedule.SportId = request.SportId;
            schedule.DayOfWeek = day;
            schedule.StartTime = start;
            schedule.EndTime = end;
            schedule.Capacity = request.Capacity;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/schedules/1
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var schedule = await _context.Schedules
                .FindAsync(id);

            if (schedule == null)
                return NotFound("Séance introuvable.");

            bool hasRegistrations = await _context.Registrations
                .AnyAsync(r => r.ScheduleId == id);

            if (hasRegistrations)
            {
                return Conflict(
                    "Impossible de supprimer une séance " +
                    "avec des inscriptions."
                );
            }

            _context.Schedules.Remove(schedule);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static bool TryValidateSchedule(
            ScheduleRequest request,
            out string day,
            out TimeSpan start,
            out TimeSpan end,
            out string error)
        {
            day = request.DayOfWeek?.Trim()
                ?? request.Day?.Trim()
                ?? "";

            start = TimeSpan.Zero;
            end = TimeSpan.Zero;
            error = "";

            if (request.SportId <= 0)
            {
                error = "Veuillez choisir un sport.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(day))
            {
                error = "Veuillez choisir un jour.";
                return false;
            }

            if (!TimeSpan.TryParse(
                request.StartTime, out start))
            {
                error = "Heure de début invalide.";
                return false;
            }

            if (!TimeSpan.TryParse(
                request.EndTime, out end))
            {
                error = "Heure de fin invalide.";
                return false;
            }

            if (start < TimeSpan.Zero ||
                start >= TimeSpan.FromDays(1) ||
                end > TimeSpan.FromDays(1) ||
                end <= start)
            {
                error =
                    "L'heure de fin doit être après " +
                    "l'heure de début.";
                return false;
            }

            if (request.Capacity <= 0)
            {
                error = "La capacité doit être supérieure à 0.";
                return false;
            }

            return true;
        }
    }

    public class ScheduleRequest
    {
        public int SportId { get; set; }

        public string? DayOfWeek { get; set; }

        public string? Day { get; set; }

        public string StartTime { get; set; } = "";

        public string EndTime { get; set; } = "";

        public int Capacity { get; set; }
    }
}
