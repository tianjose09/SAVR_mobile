<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g. 'food_angel'
            $table->string('name');
            $table->text('description');
            $table->string('goal_type'); // 'food_count', 'financial_total', 'service_count', 'total_donations'
            $table->decimal('goal_value', 12, 2);
            $table->string('icon'); // drawable name e.g. 'fivedonation_badge'
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('badges'); }
};