<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddImagesToDonationsTable extends Migration
{
    public function up()
    {
        Schema::table('donations', function (Blueprint $table) {
            // Financial receipt image
            $table->string('receipt_image_path')->nullable()->after('receipt_path');
            // Food donation photo (stored as JSON array of paths)
            $table->json('food_item_images')->nullable()->after('food_items');
        });
    }

    public function down()
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn(['receipt_image_path', 'food_item_images']);
        });
    }
}