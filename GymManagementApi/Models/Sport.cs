using Microsoft.EntityFrameworkCore;

namespace GymManagementApi.Models
{
    public class Sport
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }
        [Precision(18, 2)]
        public decimal Price { get; set; }
        public List<Schedule> Schedules { get; set; } = new();
    }
}
