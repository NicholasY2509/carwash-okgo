<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->string('car_type')->nullable()->after('customer_id');
        });

        // Migrate data
        DB::statement('UPDATE cars c JOIN car_types ct ON c.car_type_id = ct.id SET c.car_type = ct.name');

        Schema::table('cars', function (Blueprint $table) {
            $table->dropForeign(['car_type_id']);
            $table->dropColumn('car_type_id');
        });

        Schema::dropIfExists('car_types');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('car_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        // Recreate the foreign key column
        Schema::table('cars', function (Blueprint $table) {
            $table->foreignId('car_type_id')->nullable()->after('customer_id')->constrained('car_types')->onDelete('set null');
        });

        // Migrate data back
        $carTypes = DB::table('cars')->whereNotNull('car_type')->distinct()->pluck('car_type');
        foreach ($carTypes as $type) {
            $id = DB::table('car_types')->insertGetId([
                'name' => $type,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('cars')->where('car_type', $type)->update(['car_type_id' => $id]);
        }

        Schema::table('cars', function (Blueprint $table) {
            $table->dropColumn('car_type');
        });
    }
};
