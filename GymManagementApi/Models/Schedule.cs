
namespace GymManagementApi.Models
{
    public class Schedule
    {
        public int Id { get; set; }

        public int SportId { get; set; }

        public string DayOfWeek { get; set; } = string.Empty;

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public List<Registration> Registrations { get; set; } = new();

        public int Capacity { get; set; }

        public Sport Sport { get; set; } = null!;
    }
}
