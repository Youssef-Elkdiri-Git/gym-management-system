
namespace GymManagementApi.Models
{
    public class User
    {
        public int Id { get; set; }

        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "User";

        public ICollection<Payment> Payments { get; set; }
            = new List<Payment>();


        public List<Registration> Registrations { get; set; } = new();
    }
}
