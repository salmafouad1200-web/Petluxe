<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Pets Table
        Schema::create('pets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('species');
            $table->string('breed');
            $table->integer('age');
            $table->double('weight');
            $table->string('sex');
            $table->text('vaccines')->nullable(); // stored as JSON array
            $table->string('photo')->nullable();
            $table->text('medical_history')->nullable(); // stored as JSON array
            $table->text('documents')->nullable(); // stored as JSON array
            $table->timestamps();
        });

        // 2. Analyses Table
        Schema::create('analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('pet_id')->nullable()->constrained()->onDelete('set null');
            $table->string('photo');
            $table->string('animal_type');
            $table->string('breed');
            $table->float('confidence')->default(1.0);
            $table->string('age_estimation')->nullable();
            $table->string('weight_estimation')->nullable();
            $table->text('personality_traits')->nullable(); // stored as JSON array
            $table->text('behavior_analysis')->nullable(); // stored as JSON array
            $table->text('health_observations')->nullable(); // stored as JSON array
            $table->text('nutrition_recommendations')->nullable(); // stored as JSON array
            $table->timestamps();
        });

        // 3. Veterinarians Table
        Schema::create('veterinarians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('clinic_name');
            $table->string('specialty');
            $table->string('address');
            $table->string('city');
            $table->string('phone');
            $table->double('latitude');
            $table->double('longitude');
            $table->double('rating')->default(5.0);
            $table->integer('reviews_count')->default(0);
            $table->decimal('consultation_price', 8, 2)->default(50.00);
            $table->boolean('is_emergency_available')->default(false);
            $table->boolean('offers_online_consultation')->default(false);
            $table->integer('experience_years')->default(5);
            $table->text('availabilities')->nullable(); // stored as JSON array of slots
            $table->timestamps();
        });

        // 4. Appointments Table
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('veterinarian_id')->constrained()->onDelete('cascade');
            $table->foreignId('pet_id')->nullable()->constrained()->onDelete('set null');
            $table->date('date');
            $table->string('time');
            $table->string('status')->default('pending'); // 'pending', 'confirmed', 'completed', 'cancelled'
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 5. Products Table
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->double('price');
            $table->string('category'); // 'food', 'accessories', 'healthcare', 'toys'
            $table->integer('stock')->default(0);
            $table->string('image')->nullable();
            $table->double('rating')->default(5.0);
            $table->integer('reviews_count')->default(0);
            $table->timestamps();
        });

        // 6. Orders Table
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('items'); // JSON array of items details
            $table->double('total_price');
            $table->string('status')->default('pending'); // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
            $table->text('shipping_address');
            $table->string('phone');
            $table->string('payment_method'); // 'card', 'paypal', 'cash'
            $table->string('payment_status')->default('pending'); // 'pending', 'paid', 'failed'
            $table->timestamps();
        });

        // 7. Posts Table
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->string('media')->nullable();
            $table->string('media_type')->default('none'); // 'image', 'video', 'none'
            $table->text('likes')->nullable(); // JSON array of user_ids who liked
            $table->integer('likes_count')->default(0);
            $table->integer('comments_count')->default(0);
            $table->timestamps();
        });

        // 8. Comments Table
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->timestamps();
        });

        // 9. Notifications Table
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            $table->string('type'); // 'order', 'appointment', 'community', 'system'
            $table->boolean('is_read')->default(false);
            $table->text('data')->nullable(); // JSON metadata
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('veterinarians');
        Schema::dropIfExists('analyses');
        Schema::dropIfExists('pets');
    }
};
