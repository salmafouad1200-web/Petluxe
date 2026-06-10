<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OpenAiService
{
    protected $apiKey;
    protected $baseUrl = 'https://api.openai.com/v1';

    public function __construct()
    {
        $this->apiKey = env('OPENAI_API_KEY');
    }

    public function hasKey()
    {
        return !empty($this->apiKey) && $this->apiKey !== 'your-openai-api-key';
    }

    /**
     * Analyze Pet Image using OpenAI Vision
     */
    public function analyzeImage($base64Image, $mimeType)
    {
        if (!$this->hasKey()) {
            return $this->getDemoImageAnalysis();
        }

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post($this->baseUrl . '/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are PetLuxe AI, a veterinary vision specialist. Analyze the uploaded image of the pet. Return a JSON object EXACTLY with these keys: "animal_type" (e.g. Chien, Chat), "breed" (e.g. Labrador, Siamois), "confidence" (float between 0.1 and 1.0), "age_estimation" (e.g. 2 ans), "weight_estimation" (e.g. 5-7 kg), "personality_traits" (array of 3 traits in French), "behavior_analysis" (string description in French), "health_observations" (array of strings in French), "nutrition_recommendations" (array of strings in French).'
                        ],
                        [
                            'role' => 'user',
                            'content' => [
                                [
                                    'type' => 'text',
                                    'text' => 'Analyze this pet image in French.'
                                ],
                                [
                                    'type' => 'image_url',
                                    'image_url' => [
                                        'url' => "data:{$mimeType};base64,{$base64Image}"
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]);

            if ($response->successful()) {
                $content = json_decode($response->json('choices.0.message.content'), true);
                if ($content && isset($content['animal_type'])) {
                    return tap($this->normalizeAnalysisResponse($content), function ($res) {
                        $res['is_demo'] = false;
                    });
                }
            }
            
            Log::error('OpenAI Vision Error', ['status' => $response->status(), 'body' => $response->body()]);
        } catch (\Exception $e) {
            Log::error('OpenAI Vision Exception', ['message' => $e->getMessage()]);
        }

        // Fallback gracefully on error
        return $this->getDemoImageAnalysis();
    }

    /**
     * AI Chat Assistant
     */
    public function chat($userMessage, $history = [])
    {
        if (!$this->hasKey()) {
            return $this->getDemoChatResponse($userMessage);
        }

        try {
            $messages = [
                [
                    'role' => 'system',
                    'content' => 'You are PetLuxe AI, a world-class veterinary assistant. Respond in French. Provide helpful, highly empathetic, and professional advice about pet health, behavior, and nutrition. Always advise seeing a vet in person for emergencies or critical symptoms. Keep answers structured and clean using markdown.'
                ]
            ];

            foreach ($history as $h) {
                if (isset($h['sender']) && isset($h['text'])) {
                    $messages[] = [
                        'role' => $h['sender'] === 'user' ? 'user' : 'assistant',
                        'content' => $h['text']
                    ];
                }
            }

            $messages[] = ['role' => 'user', 'content' => $userMessage];

            $response = Http::withToken($this->apiKey)
                ->timeout(15)
                ->post($this->baseUrl . '/chat/completions', [
                    'model' => 'gpt-4o-mini',
                    'messages' => $messages,
                ]);

            if ($response->successful()) {
                return $response->json('choices.0.message.content');
            }

            Log::error('OpenAI Chat Error', ['status' => $response->status(), 'body' => $response->body()]);
        } catch (\Exception $e) {
            Log::error('OpenAI Chat Exception', ['message' => $e->getMessage()]);
        }

        return $this->getDemoChatResponse($userMessage);
    }

    private function normalizeAnalysisResponse($data)
    {
        return [
            'animal_type' => $data['animal_type'] ?? 'Inconnu',
            'breed' => $data['breed'] ?? 'Croisé',
            'confidence' => isset($data['confidence']) ? floatval($data['confidence']) : 0.85,
            'age_estimation' => $data['age_estimation'] ?? 'Inconnu',
            'weight_estimation' => $data['weight_estimation'] ?? 'Inconnu',
            'personality_traits' => $data['personality_traits'] ?? ['Curieux', 'Calme'],
            'behavior_analysis' => $data['behavior_analysis'] ?? 'Aucun comportement particulier détecté.',
            'health_observations' => $data['health_observations'] ?? ['L\'animal semble globalement en forme.'],
            'nutrition_recommendations' => $data['nutrition_recommendations'] ?? ['Maintenir une alimentation équilibrée.']
        ];
    }

    private function getDemoImageAnalysis()
    {
        return [
            'is_demo' => true,
            'animal_type' => 'Chien',
            'breed' => 'Golden Retriever (Démo)',
            'confidence' => 0.99,
            'age_estimation' => '2-3 ans',
            'weight_estimation' => '25-30 kg',
            'personality_traits' => ['Joueur', 'Affectueux', 'Docile'],
            'behavior_analysis' => 'L\'animal présente une posture détendue et une expression faciale amicale, typique d\'un état de bien-être et de confiance.',
            'health_observations' => [
                'Pelage dense et brillant.',
                'Yeux clairs sans signes d\'irritation.',
                'Truffe légèrement humide (signe de bonne santé).'
            ],
            'nutrition_recommendations' => [
                'Privilégier des croquettes Premium pour grands chiens.',
                'Ajouter des compléments en Oméga-3 pour le pelage.',
                'Fractionner les repas en 2 portions quotidiennes.'
            ]
        ];
    }

    private function getDemoChatResponse($userMessage)
    {
        $msg = strtolower($userMessage);

        if (str_contains($msg, 'vaccin') || str_contains($msg, 'piqûre') || str_contains($msg, 'maladie')) {
            return "Pour protéger votre animal, il est essentiel de suivre son calendrier vaccinal. \n\n- **Chiens** : Rage, Maladie de Carré, Parvovirose, Hépatite.\n- **Chats** : Coryza, Typhus, Leucose (FeLV).\n\nN'hésitez pas à planifier une consultation via notre onglet **Vétérinaires**.";
        } elseif (str_contains($msg, 'manger') || str_contains($msg, 'nourriture') || str_contains($msg, 'croquette') || str_contains($msg, 'aliment')) {
            return "Une bonne alimentation est la clé de voûte de la santé de votre compagnon. \nJe vous recommande d'opter pour des croquettes ou des pâtées 'Premium' riches en protéines animales. Évitez les aliments contenant trop de glucides et dosez la ration selon son poids.";
        } elseif (str_contains($msg, 'vomit') || str_contains($msg, 'malade') || str_contains($msg, 'diarrhée') || str_contains($msg, 'sang')) {
            return "⚠️ **Attention (URGENCE)** : Si votre animal vomit de façon répétée ou a de la diarrhée, cela peut traduire une intoxication ou occlusion.\n\n**Action immédiate** :\n1. Mettez-le à la diète pendant 12h (laissez l'eau à disposition).\n2. Prenez rendez-vous immédiatement avec un vétérinaire.";
        } elseif (str_contains($msg, 'dressage') || str_contains($msg, 'comportement') || str_contains($msg, 'aboie')) {
            return "L'éducation positive est toujours la méthode la plus efficace !\nRécompensez les bons comportements (friandises, caresses) et ignorez ou réorientez les mauvais. La patience et la régularité (séances de 5-10 minutes) sont fondamentales.";
        }

        return "Bonjour ! Je suis **PetLuxe AI** (Mode Démo). \nJe peux vous guider pour toute question sur la santé, la nutrition ou l'éducation de vos animaux. Posez-moi des questions sur les vaccins, l'alimentation, ou les urgences !";
    }
}
