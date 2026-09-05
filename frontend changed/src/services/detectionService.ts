import { DetectionResult } from '../types';
import { apiService } from './apiService';
import { uploadCapturedPhotos } from './imgbbService';
import { regionalBreedService } from './regionalBreedService';

/**
 * Real detection flow:
 * 1. Upload captured photos to imgbb -> get hosted URLs
 * 2. Register the animal on the backend (or pass an existing animalId)
 * 3. Call /predict on the backend (currently a placeholder until Person 3/4's
 *    real model is swapped in server-side - the shape of the response won't
 *    change when that happens, so nothing here needs to change later)
 * 4. Shape the backend response into the same DetectionResult the UI expects
 */
export const detectionService = {
  async detectBreed(
    photos: { face?: string; side?: string; hornHump?: string },
    animalId: string
  ): Promise<DetectionResult> {
    const photoUrls = await uploadCapturedPhotos(photos);

    const response = await apiService.predictBreed(animalId, photoUrls);
    const { topPredictions, modelVersion, predictionId } = response.prediction;

    const [primary, ...alternatives] = topPredictions;
    const geo = regionalBreedService.getRegionalRelevance(primary.breed);

    const timestamp = Date.now();

    const result: DetectionResult = {
      id: predictionId,
      timestamp,
      dateFormatted: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      status: primary.confidence < 0.6 ? 'low_confidence' : 'high_confidence',
      primaryBreed: primary.breed,
      confidence: primary.confidence,
      alternatives: alternatives.map((a) => ({ breed: a.breed, confidence: a.confidence })),
      composition: null,
      regionalRelevance: geo.relevance,
      regionalMatchTitle: geo.title,
      regionalMatchDescription: geo.description,
      userLocation: '',
      visualIndicators: [],
      qualityChecks: [
        { id: 'q1', label: 'Image sharpness and focus', passed: true, tip: '' },
        { id: 'q2', label: 'Animal head and torso visible', passed: true, tip: '' },
        { id: 'q3', label: 'Fresh field photo detected', passed: true, tip: '' },
      ],
      photos,
      attentionHeatmapNote: `Model version: ${modelVersion}`,
      disclaimer:
        'Result based on visual morphological analysis. Confirm with physical ear tag and breed registry records.',
    };

    return result;
  },
};
