<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected $apiKey;
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
        if (empty($this->apiKey)) {
            Log::error('GEMINI_API_KEY NOT FOUND');
        }
    }

    public function hasKey()
    {
        return !empty($this->apiKey) && $this->apiKey !== 'your-gemini-api-key';
    }

    /**
     * Analyze Pet Image using Gemini 1.5 Flash
     */
    public function analyzeImage($base64Image, $mimeType)
    {
        if (!$this->hasKey()) {
            Log::info('Gemini API key missing, falling back to demo image analysis');
            return $this->getDemoImageAnalysis();
        }

        try {
            $prompt = 'You are an expert AI specialized in animal vision recognition and pet analysis. From the image, detect: Animal type, Possible breed, Age estimation, Size estimation, Health appearance, Behavioral interpretation, Personality traits. Return ONLY this format STRICTLY in JSON: {"animal_type": "","breed": "","confidence": 0.0,"age_estimation": "","size": "","health_analysis": "","behavior_analysis": "","personality_traits": []}. Always respond in French (translate the keys\' values to French). IMPORTANT: If the image is unclear, blurry, or does not contain an animal, do not invent information. Set "animal_type" to "Non reconnu", "confidence" to 0.0, and write "Veuillez fournir une image plus nette." in "health_analysis".';

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'x-goog-api-key' => $this->apiKey
            ])
            ->timeout(30)
            ->retry(3, 1000) // Retry up to 3 times with 1000ms delay on failure
            ->post($this->baseUrl . '/gemini-flash-latest:generateContent', [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data' => $base64Image
                                ]
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json'
                ]
            ]);

            if ($response->successful()) {
                Log::info('Gemini Image Analysis success');
                // Gemini returns text inside candidates[0].content.parts[0].text
                $contentStr = $response->json('candidates.0.content.parts.0.text');
                
                // Sometimes Gemini wraps JSON in markdown block ```json ... ```
                $contentStr = str_replace(['```json', '```'], '', $contentStr);
                $contentStr = trim($contentStr);

                $content = json_decode($contentStr, true);
                
                if ($content && isset($content['animal_type'])) {
                    return tap($this->normalizeAnalysisResponse($content), function (&$res) {
                        $res['is_demo'] = false;
                    });
                }
            }
            
            Log::warning('Gemini Vision Error or Invalid JSON', ['status' => $response->status(), 'body' => $response->body()]);
        } catch (\Exception $e) {
            Log::error('Gemini Vision Exception', ['message' => $e->getMessage()]);
        }

        // Fallback gracefully on error
        return $this->getDemoImageAnalysis();
    }

    /**
     * AI Chat Assistant
     */
    public function chat($userMessage, $history = [], $pets = [])
    {
        Log::info('Gemini hasKey(): ' . ($this->hasKey() ? 'true' : 'false'));

        if (!$this->hasKey()) {
            Log::info('Gemini API key missing, falling back to silent error');
            return $this->getDemoChatResponse($userMessage);
        }

        try {
            $contents = [];

            // Add history
            foreach ($history as $h) {
                if (isset($h['sender']) && isset($h['text'])) {
                    $contents[] = [
                        'role' => $h['sender'] === 'user' ? 'user' : 'model',
                        'parts' => [['text' => $h['text']]]
                    ];
                }
            }

            // Add current message
            $contents[] = [
                'role' => 'user',
                'parts' => [['text' => $userMessage]]
            ];

            // Build pet context string
            $petContext = "";
            if (count($pets) > 0) {
                $petContext = "L'utilisateur possède ces animaux enregistrés :\n";
                foreach ($pets as $pet) {
                    $petContext .= "- {$pet->name} ({$pet->species}, {$pet->breed}), Âge: {$pet->age}, Poids: {$pet->weight}kg. Notes médicales: {$pet->medical_conditions}.\n";
                }
                $petContext .= "Utilise ces informations naturellement pour personnaliser tes réponses.\n\n";
            }

            $systemInstruction = [
                'parts' => [
                    ['text' => "You are PetLuxe AI, a world-class veterinary assistant. Respond in French. Provide helpful, highly empathetic, and professional advice about pet health, behavior, and nutrition. Always advise seeing a vet in person for emergencies or critical symptoms. Keep answers structured and clean using markdown.\n\n" . $petContext]
                ]
            ];

            $payload = [
                'systemInstruction' => $systemInstruction,
                'contents' => $contents,
            ];

            Log::info('Gemini HTTP Request payload', ['payload' => json_encode($payload)]);

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'x-goog-api-key' => $this->apiKey
            ])
            ->timeout(15)
            ->retry(3, 1000) // Retry up to 3 times
            ->post($this->baseUrl . '/gemini-flash-latest:generateContent', $payload);

            Log::info('Gemini Status Code: ' . $response->status());

            if ($response->successful()) {
                Log::info('Gemini Chat success. Returning real response.');
                return $response->json('candidates.0.content.parts.0.text');
            }

            Log::warning('Gemini Chat Error', ['status' => $response->status(), 'body' => $response->body()]);
        } catch (\Exception $e) {
            Log::error('Gemini Chat Exception', ['message' => $e->getMessage()]);
        }

        return $this->getDemoChatResponse($userMessage);
    }

    private function normalizeAnalysisResponse($data)
    {
        return [
            'animal_type' => $data['animal_type'] ?? 'Inconnu',
            'breed' => $data['breed'] ?? 'Inconnue',
            'confidence' => isset($data['confidence']) ? floatval($data['confidence']) : 0.85,
            'age_estimation' => $data['age_estimation'] ?? 'Inconnu',
            // Map the prompt's `size` to DB's `weight_estimation` to avoid schema break
            'weight_estimation' => $data['size'] ?? 'Inconnu',
            'personality_traits' => $data['personality_traits'] ?? ['Curieux'],
            'behavior_analysis' => $data['behavior_analysis'] ?? 'Aucun comportement particulier.',
            // Map the prompt's `health_analysis` to DB's `health_observations`
            'health_observations' => isset($data['health_analysis']) ? [$data['health_analysis']] : ['Semble en bonne santé'],
            // Prompt did not ask for nutrition, we provide an empty array or default
            'nutrition_recommendations' => ['Maintenir une alimentation équilibrée adaptée.']
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
            'weight_estimation' => 'Grand', // size mapped to weight_estimation
            'personality_traits' => ['Joueur', 'Affectueux', 'Docile'],
            'behavior_analysis' => 'L\'animal présente une posture détendue et amicale.',
            'health_observations' => [
                'Apparence en bonne santé.'
            ],
            'nutrition_recommendations' => [
                'Privilégier des croquettes Premium.'
            ]
        ];
    }

    private function getDemoChatResponse($userMessage)
    {
        return "Je rencontre actuellement un petit souci technique pour me connecter à mon réseau principal. Veuillez réessayer dans quelques instants !";
    }
}
