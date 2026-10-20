
namespace GymManagementApi.Models
{
    public class Registration
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int ScheduleId { get; set; }
        public Schedule Schedule { get; set; } = null!;

        public DateTime RegistrationDate { get; set; }

        public string Status { get; set; } = "Active";
    }
}
