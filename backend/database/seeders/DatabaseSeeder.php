<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Pet;
use App\Models\Analysis;
use App\Models\Veterinarian;
use App\Models\Appointment;
use App\Models\Product;
use App\Models\Order;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users
        $admin = User::create([
            'name' => 'Admin PetLuxe',
            'email' => 'admin@petluxe.com',
            'phone' => '+33123456789',
            'avatar' => 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
            'role' => 'admin',
            'password' => Hash::make('password123'),
        ]);

        $vet1User = User::create([
            'name' => 'Dr. Sophie Laurent',
            'email' => 'sophie.laurent@petluxe.com',
            'phone' => '+33612345678',
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie',
            'role' => 'veterinarian',
            'password' => Hash::make('password123'),
        ]);

        $vet2User = User::create([
            'name' => 'Dr. Marc Dubois',
            'email' => 'marc.dubois@petluxe.com',
            'phone' => '+33687654321',
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=marc',
            'role' => 'veterinarian',
            'password' => Hash::make('password123'),
        ]);

        $user1 = User::create([
            'name' => 'Utilisateur Test',
            'email' => 'user@petluxe.com',
            'phone' => '+33611223344',
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
            'role' => 'user',
            'password' => Hash::make('password123'),
        ]);

        $user2 = User::create([
            'name' => 'Lucas Bernard',
            'email' => 'lucas.bernard@gmail.com',
            'phone' => '+33655667788',
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucas',
            'role' => 'user',
            'password' => Hash::make('password123'),
        ]);

        // 2. Seed Veterinarian Profiles
        $vet1 = Veterinarian::create([
            'user_id' => $vet1User->id,
            'clinic_name' => "Clinique Vétérinaire de l'Étoile",
            'specialty' => 'Chiens, Chats & Cardiologie',
            'address' => '25 Rue de la Paix',
            'city' => 'Paris',
            'phone' => '+33140203040',
            'latitude' => 48.8698,
            'longitude' => 2.3308,
            'rating' => 4.9,
            'reviews_count' => 42,
            'consultation_price' => 50.00,
            'is_emergency_available' => true,
            'offers_online_consultation' => true,
            'experience_years' => 12,
            'availabilities' => [
                'Monday' => ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
                'Tuesday' => ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
                'Friday' => ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
            ]
        ]);

        $vet2 = Veterinarian::create([
            'user_id' => $vet2User->id,
            'clinic_name' => 'Cabinet Vétérinaire des Prés',
            'specialty' => 'Nouveaux Animaux de Compagnie (NAC) & Nutrition',
            'address' => '12 Avenue des Champs-Élysées',
            'city' => 'Paris',
            'phone' => '+33150607080',
            'latitude' => 48.8725,
            'longitude' => 2.3025,
            'rating' => 4.7,
            'reviews_count' => 18,
            'consultation_price' => 45.00,
            'is_emergency_available' => false,
            'offers_online_consultation' => false,
            'experience_years' => 8,
            'availabilities' => [
                'Wednesday' => ['10:00', '11:00', '14:00', '15:00', '16:00'],
                'Thursday' => ['10:00', '11:00', '14:00', '15:00', '16:00']
            ]
        ]);

        // Seed Moroccan Veterinarians
        $this->call([
            VeterinarianSeeder::class,
        ]);

        // 3. Seed Pets
        $pet1 = Pet::create([
            'user_id' => $user1->id,
            'name' => 'Max',
            'species' => 'Chien',
            'breed' => 'Golden Retriever',
            'age' => 3,
            'weight' => 32.4,
            'sex' => 'Mâle',
            'vaccines' => ['Rage (2025)', 'Parvovirus (2026)', 'Maladie de Carré (2026)'],
            'photo' => 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
            'medical_history' => [
                ['date' => '2025-04-12', 'type' => 'Consultation', 'description' => 'Entorse patte avant gauche - repos prescrit.'],
                ['date' => '2026-01-10', 'type' => 'Vaccination', 'description' => 'Rappels annuels effectués.']
            ],
            'documents' => [
                ['name' => 'Passeport Européen Max.pdf', 'url' => '#'],
                ['name' => 'Radiographie Patte.jpg', 'url' => '#']
            ]
        ]);

        $pet2 = Pet::create([
            'user_id' => $user2->id,
            'name' => 'Bella',
            'species' => 'Chat',
            'breed' => 'Siamois',
            'age' => 2,
            'weight' => 4.1,
            'sex' => 'Femelle',
            'vaccines' => ['Typhus (2025)', 'Coryza (2026)'],
            'photo' => 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
            'medical_history' => [
                ['date' => '2024-09-15', 'type' => 'Chirurgie', 'description' => 'Stérilisation effectuée sans complication.']
            ],
            'documents' => [
                ['name' => 'Certificat de Stérilisation.pdf', 'url' => '#']
            ]
        ]);

        // 4. Seed AI Analyses
        Analysis::create([
            'user_id' => $user1->id,
            'pet_id' => $pet1->id,
            'photo' => 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
            'animal_type' => 'Chien',
            'breed' => 'Golden Retriever',
            'confidence' => 0.95,
            'age_estimation' => '3 ans',
            'weight_estimation' => '28-34 kg',
            'personality_traits' => ['Affectueux', 'Intelligent', 'Énergique'],
            'behavior_analysis' => 'Ce chien semble être dans un état calme et attentif.',
            'health_observations' => [
                'Pelage brillant indiquant une bonne santé.',
                'Yeux clairs sans écoulement.'
            ],
            'nutrition_recommendations' => [
                'Favoriser des croquettes riches en protéines de haute qualité.',
                'Limiter les friandises grasses.'
            ]
        ]);

        // 5. Seed Products
        $p1 = Product::create([
            'name' => 'Croquettes Premium Chien Adulte',
            'description' => 'Aliment complet pour chiens de grande race. Formule riche en poulet et riz, favorisant une digestion facile et un pelage brillant.',
            'price' => 59.99,
            'category' => 'food',
            'stock' => 50,
            'image' => 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=400',
            'rating' => 4.8,
            'reviews_count' => 125,
        ]);

        $p2 = Product::create([
            'name' => 'Collier en Cuir Artisanal Brun',
            'description' => 'Collier élégant en cuir véritable pleine fleur avec bouclerie en laiton massif. Ajustable et ultra-confortable pour votre animal.',
            'price' => 29.99,
            'category' => 'accessories',
            'stock' => 20,
            'image' => 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400',
            'rating' => 4.5,
            'reviews_count' => 45,
        ]);

        $p3 = Product::create([
            'name' => 'Complément Articulations pour Senior',
            'description' => 'Comprimés appétents enrichis en glucosamine et chondroïtine. Recommandé par les vétérinaires pour soulager l\'arthrose.',
            'price' => 42.50,
            'category' => 'healthcare',
            'stock' => 15,
            'image' => 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&q=80&w=400',
            'rating' => 4.9,
            'reviews_count' => 88,
        ]);

        $p4 = Product::create([
            'name' => 'Balle Interactive Lanceuse Automatique',
            'description' => 'Jouet intelligent pour stimuler l\'éveil de votre chien. Roule de façon aléatoire et distribue des friandises.',
            'price' => 34.99,
            'category' => 'toys',
            'stock' => 8,
            'image' => 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=400',
            'rating' => 4.2,
            'reviews_count' => 12,
        ]);

        $p5 = Product::create([
            'name' => 'Arbre à Chat Multi-Niveaux Premium',
            'description' => 'Tour d\'escalade en bois naturel avec hamac doux, griffoirs en sisal et cachette spacieuse. Idéal pour plusieurs chats.',
            'price' => 129.90,
            'category' => 'accessories',
            'stock' => 12,
            'image' => 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&q=80&w=400',
            'rating' => 4.7,
            'reviews_count' => 56,
        ]);

        $p6 = Product::create([
            'name' => 'Shampooing Apaisant à l\'Avoine',
            'description' => 'Formule douce sans larmes, parfaite pour les chiots et les chiens à la peau sensible. Laisse le pelage soyeux et délicatement parfumé.',
            'price' => 14.50,
            'category' => 'healthcare',
            'stock' => 35,
            'image' => 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=400',
            'rating' => 4.9,
            'reviews_count' => 204,
        ]);

        $p7 = Product::create([
            'name' => 'Laisse Rétractable 5 Mètres avec LED',
            'description' => 'Laisse robuste pour chiens jusqu\'à 30kg. Intègre une lampe LED puissante pour vos balades nocturnes en toute sécurité.',
            'price' => 24.99,
            'category' => 'accessories',
            'stock' => 40,
            'image' => 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&q=80&w=400',
            'rating' => 4.3,
            'reviews_count' => 78,
        ]);

        $p8 = Product::create([
            'name' => 'Gamelle Anti-Glouton Labyrinthe',
            'description' => 'Conçue pour ralentir la prise des repas de 10 fois. Prévient les ballonnements, l\'obésité et favorise une digestion saine.',
            'price' => 18.90,
            'category' => 'food',
            'stock' => 60,
            'image' => 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400',
            'rating' => 4.6,
            'reviews_count' => 112,
        ]);

        // 6. Seed Orders
        Order::create([
            'user_id' => $user1->id,
            'items' => [
                [
                    'product_id' => $p1->id,
                    'name' => $p1->name,
                    'price' => $p1->price,
                    'quantity' => 1
                ],
                [
                    'product_id' => $p2->id,
                    'name' => $p2->name,
                    'price' => $p2->price,
                    'quantity' => 1
                ]
            ],
            'total_price' => 89.98,
            'status' => 'delivered',
            'shipping_address' => '75 Rue de Rivoli, 75001 Paris',
            'phone' => $user1->phone,
            'payment_method' => 'card',
            'payment_status' => 'paid'
        ]);

        // 7. Seed Appointments
        Appointment::create([
            'user_id' => $user1->id,
            'veterinarian_id' => $vet1->id,
            'pet_id' => $pet1->id,
            'date' => date('Y-m-d', strtotime('+3 days')),
            'time' => '10:00',
            'status' => 'confirmed',
            'notes' => 'Vaccination annuelle et contrôle de l\'entorse.'
        ]);

        Appointment::create([
            'user_id' => $user2->id,
            'veterinarian_id' => $vet2->id,
            'pet_id' => $pet2->id,
            'date' => date('Y-m-d', strtotime('+5 days')),
            'time' => '15:00',
            'status' => 'pending',
            'notes' => 'Conseils nutritionnels pour changement de croquettes.'
        ]);

        // 8. Seed Social Posts & Comments
        $post1 = Post::create([
            'user_id' => $user1->id,
            'content' => 'Max s\'éclate avec son nouveau jouet interactif commandé hier sur PetLuxe ! Livraison ultra rapide ! 🐾',
            'media' => 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=400',
            'media_type' => 'image',
            'likes' => [$user2->id],
            'likes_count' => 1,
            'comments_count' => 1,
        ]);

        Comment::create([
            'post_id' => $post1->id,
            'user_id' => $user2->id,
            'content' => 'Génial ! Je pense commander le même pour Bella ! 😍',
        ]);

        // 9. Seed Notifications
        Notification::create([
            'user_id' => $user1->id,
            'title' => 'Rendez-vous Confirmé !',
            'content' => 'Votre rendez-vous avec Dr. Sophie Laurent pour Max a été validé.',
            'type' => 'appointment',
            'is_read' => false,
            'data' => ['appointment_id' => 1]
        ]);

        Notification::create([
            'user_id' => $user1->id,
            'title' => 'Commande Expédiée',
            'content' => 'Votre colis PetLuxe #1001 a été remis au transporteur.',
            'type' => 'order',
            'is_read' => true,
            'data' => ['order_id' => 1]
        ]);
    }
}
