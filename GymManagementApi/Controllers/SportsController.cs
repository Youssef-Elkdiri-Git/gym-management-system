
using GymManagementApi.Data;
using GymManagementApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagementApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SportsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/sports
        // Public - everyone can see sports
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<Sport>>> GetSports()
        {
            var sports = await _context.Sports.ToListAsync();

            return Ok(sports);
        }

        // GET: api/sports/1
        // Public - everyone can see sport details
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Sport>> GetSportById(int id)
        {
            var sport = await _context.Sports.FindAsync(id);

            if (sport == null)
                return NotFound();

            return Ok(sport);
        }

        // POST: api/sports
        // Admin only
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Sport>> CreateSport(Sport sport)
        {
            _context.Sports.Add(sport);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetSportById),
                new { id = sport.Id },
                sport
            );
        }

        // PUT: api/sports/1
        // Admin only
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSport(int id, Sport sport)
        {
            if (id != sport.Id)
                return BadRequest("Sport ID mismatch.");

            var existingSport = await _context.Sports.FindAsync(id);

            if (existingSport == null)
                return NotFound();

            existingSport.Name = sport.Name;
            existingSport.Description = sport.Description;
            existingSport.Price = sport.Price;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/sports/1
        // Admin only
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSport(int id)
        {
            var sport = await _context.Sports.FindAsync(id);

            if (sport == null)
                return NotFound();

            _context.Sports.Remove(sport);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
