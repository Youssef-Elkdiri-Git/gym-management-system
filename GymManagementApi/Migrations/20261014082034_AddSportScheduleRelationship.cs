using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymManagementApi.Migrations
{
    /// <inheritdoc />
    public partial class AddSportScheduleRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Schedules_SportId",
                table: "Schedules",
                column: "SportId");

            migrationBuilder.AddForeignKey(
                name: "FK_Schedules_Sports_SportId",
                table: "Schedules",
                column: "SportId",
                principalTable: "Sports",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Schedules_Sports_SportId",
                table: "Schedules");

            migrationBuilder.DropIndex(
                name: "IX_Schedules_SportId",
                table: "Schedules");
        }
    }
}
