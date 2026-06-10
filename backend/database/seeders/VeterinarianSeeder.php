<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Veterinarian;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class VeterinarianSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('fr_FR');
        
        $cities = [
            ['name' => 'Casablanca', 'lat' => 33.5731, 'lng' => -7.5898, 'radius' => 0.05],
            ['name' => 'Rabat', 'lat' => 33.9716, 'lng' => -6.8498, 'radius' => 0.04],
            ['name' => 'Marrakech', 'lat' => 31.6295, 'lng' => -7.9811, 'radius' => 0.04],
            ['name' => 'Tanger', 'lat' => 35.7595, 'lng' => -5.8340, 'radius' => 0.03],
            ['name' => 'Agadir', 'lat' => 30.4278, 'lng' => -9.5981, 'radius' => 0.03],
            ['name' => 'Mohammedia', 'lat' => 33.6852, 'lng' => -7.3853, 'radius' => 0.02],
        ];

        $specialties = [
            'Médecine Générale (Chiens et Chats)',
            'Chirurgie Vétérinaire',
            'Nouveaux Animaux de Compagnie (NAC)',
            'Dermatologie & Allergies',
            'Cardiologie Animale',
            'Ophtalmologie Vétérinaire',
            'Médecine Interne',
            'Nutrition et Diététique'
        ];

        // Generate 50 Veterinarians
        for ($i = 0; $i < 50; $i++) {
            $city = $faker->randomElement($cities);
            
            // Random coordinates around the city center
            $lat = $city['lat'] + (lcg_value() * 2 - 1) * $city['radius'];
            $lng = $city['lng'] + (lcg_value() * 2 - 1) * $city['radius'];

            $gender = $faker->randomElement(['male', 'female']);
            $firstName = $faker->firstName($gender);
            $lastName = $faker->lastName();
            $seedAvatar = strtolower($firstName . $lastName);

            $user = User::create([
                'name' => "Dr. $firstName $lastName",
                'email' => "vet$i@petluxe.ma",
                'phone' => '+2126' . $faker->randomNumber(8, true),
                'avatar' => "https://api.dicebear.com/7.x/avataaars/svg?seed=$seedAvatar",
                'role' => 'veterinarian',
                'password' => Hash::make('password123'),
            ]);

            Veterinarian::create([
                'user_id' => $user->id,
                'clinic_name' => "Clinique Vétérinaire " . $faker->randomElement(['des Petits Amis', 'de la Santé Animale', 'du Centre', 'du Soleil', 'des Oliviers', 'El Wafa', 'Ibn Sina', 'Animax']),
                'specialty' => $faker->randomElement($specialties),
                'address' => $faker->buildingNumber() . ' ' . $faker->streetName(),
                'city' => $city['name'],
                'phone' => '+2125' . $faker->randomNumber(8, true),
                'latitude' => $lat,
                'longitude' => $lng,
                'rating' => $faker->randomFloat(1, 3.5, 5.0),
                'reviews_count' => $faker->numberBetween(5, 120),
                'consultation_price' => $faker->randomElement([250, 300, 350, 400, 500]), // MAD disguised as EUR if needed, but let's keep number
                'is_emergency_available' => $faker->boolean(30), // 30% chance of emergency
                'offers_online_consultation' => $faker->boolean(40),
                'experience_years' => $faker->numberBetween(2, 25),
                'availabilities' => [
                    'Monday' => ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
                    'Tuesday' => ['09:00', '10:00', '11:00', '14:00', '15:00'],
                    'Wednesday' => ['09:00', '10:00', '11:00'],
                    'Thursday' => ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
                    'Friday' => ['09:00', '10:00', '11:00', '15:00', '16:00']
                ]
            ]);
        }
    }
}
