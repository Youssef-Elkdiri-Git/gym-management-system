using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymManagementApi.Migrations
{
    /// <inheritdoc />
    public partial class AddRegistrationRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Registrations_ScheduleId",
                table: "Registrations",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_UserId_ScheduleId",
                table: "Registrations",
                columns: new[] { "UserId", "ScheduleId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Registrations_Schedules_ScheduleId",
                table: "Registrations",
                column: "ScheduleId",
                principalTable: "Schedules",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Registrations_Users_UserId",
                table: "Registrations",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Registrations_Schedules_ScheduleId",
                table: "Registrations");

            migrationBuilder.DropForeignKey(
                name: "FK_Registrations_Users_UserId",
                table: "Registrations");

            migrationBuilder.DropIndex(
                name: "IX_Registrations_ScheduleId",
                table: "Registrations");

            migrationBuilder.DropIndex(
                name: "IX_Registrations_UserId_ScheduleId",
                table: "Registrations");
        }
    }
}
