
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
    public class PaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaymentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/payments
        // Admin sees all; users see only their own
        [HttpGet]
        public async Task<IActionResult> GetPayments()
        {
            var query = _context.Payments.AsQueryable();

            if (!User.IsInRole("Admin"))
            {
                if (!TryGetUserId(out int userId))
                    return Unauthorized();

                query = query.Where(p => p.UserId == userId);
            }

            var payments = await query
                .Select(p => new
                {
                    p.Id,
                    p.UserId,
                    p.Amount,
                    p.StartDate,
                    p.EndDate,
                    p.Status
                })
                .ToListAsync();

            return Ok(payments);
        }

        // GET: api/payments/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPayment(int id)
        {
            var payment = await _context.Payments.FindAsync(id);

            if (payment == null)
                return NotFound();

            if (!User.IsInRole("Admin"))
            {
                if (!TryGetUserId(out int userId))
                    return Unauthorized();

                if (payment.UserId != userId)
                    return NotFound();
            }

            return Ok(new
            {
                payment.Id,
                payment.UserId,
                payment.Amount,
                payment.StartDate,
                payment.EndDate,
                payment.Status
            });
        }

        // POST: api/payments
        // Only Admin can create payment records
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreatePayment(
            PaymentRequest request)
        {
            var userExists = await _context.Users
                .AnyAsync(u => u.Id == request.UserId);

            if (!userExists)
                return BadRequest("User does not exist.");

            if (request.EndDate <= request.StartDate)
                return BadRequest(
                    "EndDate must be after StartDate."
                );

            var payment = new Payment
            {
                UserId = request.UserId,
                Amount = request.Amount,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = "Unpaid"
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetPayment),
                new { id = payment.Id },
                new
                {
                    payment.Id,
                    payment.UserId,
                    payment.Amount,
                    payment.Status
                }
            );
        }

        // PUT: api/payments/1/status
        // Only Admin can update payment status
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePaymentStatus(
            int id,
            UpdatePaymentStatusRequest request)
        {
            var payment = await _context.Payments.FindAsync(id);

            if (payment == null)
                return NotFound();

            payment.Status = request.Status;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                payment.Id,
                payment.Status
            });
        }

        // DELETE: api/payments/1
        // Only Admin can delete payment records
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var payment = await _context.Payments.FindAsync(id);

            if (payment == null)
                return NotFound();

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TryGetUserId(out int userId)
        {
            var userIdText = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            return int.TryParse(userIdText, out userId);
        }
    }


    public class PaymentRequest
    {
        [Range(1, int.MaxValue)]
        public int UserId { get; set; }

        [Range(
            typeof(decimal),
            "0.01",
            "99999999",
            ParseLimitsInInvariantCulture = true)]
        public decimal Amount { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }
    }


    public class UpdatePaymentStatusRequest
    {
        [Required]
        [RegularExpression(
            "^(Paid|Unpaid|Expired)$",
            ErrorMessage = "Status must be Paid, Unpaid or Expired."
        )]
        public string Status { get; set; } = string.Empty;
    }
}
