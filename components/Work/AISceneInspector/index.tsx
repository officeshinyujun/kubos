'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import s from './style.module.scss';
import { useSceneStore } from '@/stores/useSceneStore';
import { useEditorStore } from '@/stores/useEditStore';
import { inspectScene } from '@/utils/aiSceneInspector';
import { analyzeSceneWithGemini, GeminiSceneAnalysis } from '@/utils/geminiVision';
import { VStack } from '@/components/general/VStack';
import { HStack } from '@/components/general/HStack';
import Typo from '@/components/general/Typo';

const STORAGE_KEY = 'kubos-gemini-api-key';

export default function AISceneInspector() {
  const objects = useSceneStore((state) => state.objects);
  const groupObjectsAtRoot = useSceneStore((state) => state.groupObjectsAtRoot);
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const selectObject = useEditorStore((state) => state.selectObject);

  const [apiKey, setApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [geminiResult, setGeminiResult] = useState<GeminiSceneAnalysis | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setApiKey(stored);
  }, []);

  const handleApiKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApiKey(value);
    localStorage.setItem(STORAGE_KEY, value);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!apiKey.trim()) {
      toast.error('Gemini API 키를 입력해주세요.');
      return;
    }

    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) {
      toast.error('캔버스를 찾을 수 없습니다.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Capture viewport: get the WebGL context and read pixels in the current frame
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      let imageBase64: string;

      if (gl) {
        // Force a synchronous pixel read from the current framebuffer
        const width = gl.drawingBufferWidth;
        const height = gl.drawingBufferHeight;
        const pixels = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        // Flip vertically (WebGL reads bottom-to-top)
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const ctx = tempCanvas.getContext('2d')!;
        const imageData = ctx.createImageData(width, height);

        for (let y = 0; y < height; y++) {
          const srcRow = (height - y - 1) * width * 4;
          const dstRow = y * width * 4;
          imageData.data.set(pixels.subarray(srcRow, srcRow + width * 4), dstRow);
        }

        ctx.putImageData(imageData, 0, 0);
        imageBase64 = tempCanvas.toDataURL('image/png');
      } else {
        // Fallback: direct toDataURL (may return blank without preserveDrawingBuffer)
        imageBase64 = canvas.toDataURL('image/png');
      }

      const result = await analyzeSceneWithGemini({ apiKey, imageBase64 });
      setGeminiResult(result);
      toast.success('씬 분석 완료!');
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [apiKey]);

  const inspection = useMemo(() => inspectScene(objects, selectedObjectId), [objects, selectedObjectId]);

  const handleApplyRecommendation = (groupName?: string, objectNames?: string[]) => {
    if (!groupName || !objectNames || objectNames.length < 2) {
      toast.error('적용할 수 있는 최적화 대상이 없습니다.');
      return;
    }

    const didGroup = groupObjectsAtRoot(groupName, objectNames);

    if (!didGroup) {
      toast.error('루트 레벨 메시를 그룹화하지 못했습니다.');
      return;
    }

    toast.success(`${objectNames.length}개 메시를 ${groupName}으로 정리했습니다.`);
    selectObject(groupName);
  };

  return (
    <VStack className={s.container} gap={16} fullWidth>
      <VStack gap={6} fullWidth>
        <Typo.BD size={16}>AI Smart Scene Inspector</Typo.BD>
        <Typo.MD size={12} color="secondary">
          지금은 결정론적 씬 분석 엔진으로 동작하고, 이후 같은 WebGL 컨텍스트 기반 TF.js 추론 레이어를 붙일 수 있게 설계했습니다.
        </Typo.MD>
      </VStack>

      <VStack gap={10} fullWidth>
        <Typo.SM size={14}>Gemini Vision 분석</Typo.SM>
        <VStack className={s.sectionCard} gap={10} fullWidth>
          <Typo.MD size={12} color="secondary">API Key</Typo.MD>
          <input
            type="password"
            className={s.apiKeyInput}
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Gemini API Key를 입력하세요"
          />
          <button
            className={s.analyzeButton}
            onClick={handleAnalyze}
            disabled={!apiKey.trim() || isAnalyzing}
          >
            {isAnalyzing ? '분석 중...' : '씬 분석'}
          </button>
        </VStack>
      </VStack>

      {isAnalyzing && (
        <VStack className={s.loading} gap={8} fullWidth align="center">
          <Typo.MD size={12} color="secondary">Gemini가 씬을 분석하고 있습니다...</Typo.MD>
        </VStack>
      )}

      {geminiResult && (
        <VStack gap={10} fullWidth>
          <Typo.SM size={14}>Gemini 분석 결과</Typo.SM>

          <VStack className={s.resultSection} gap={10} fullWidth>
            <Typo.MD size={12}>{geminiResult.summary}</Typo.MD>
          </VStack>

          {geminiResult.objects.length > 0 && (
            <VStack gap={8} fullWidth>
              <Typo.MD size={12} color="secondary">감지된 객체</Typo.MD>
              {geminiResult.objects.map((obj, i) => (
                <HStack key={i} className={s.objectCard} gap={8} align="center" fullWidth>
                  <VStack gap={4} fullWidth>
                    <HStack justify="between" align="center" fullWidth>
                      <Typo.BD size={12}>{obj.label}</Typo.BD>
                      <span className={s.confidenceBadge}>
                        {Math.round(obj.confidence * 100)}%
                      </span>
                    </HStack>
                    <Typo.MD size={12} color="secondary">
                      {obj.category}{obj.position.region ? ` · ${obj.position.region}` : ''}
                      {obj.size ? ` · ${obj.size}` : ''}
                    </Typo.MD>
                    {obj.notes && <Typo.MD size={12}>{obj.notes}</Typo.MD>}
                  </VStack>
                </HStack>
              ))}
            </VStack>
          )}

          {geminiResult.issues.length > 0 && (
            <VStack gap={8} fullWidth>
              <Typo.MD size={12} color="secondary">발견된 이슈</Typo.MD>
              {geminiResult.issues.map((issue, i) => (
                <div key={i} className={s.issueItem}>
                  <Typo.MD size={12}>{issue}</Typo.MD>
                </div>
              ))}
            </VStack>
          )}

          {geminiResult.optimizationSuggestions.length > 0 && (
            <VStack gap={8} fullWidth>
              <Typo.MD size={12} color="secondary">최적화 제안</Typo.MD>
              {geminiResult.optimizationSuggestions.map((suggestion, i) => (
                <div key={i} className={s.issueItem}>
                  <Typo.MD size={12}>{suggestion}</Typo.MD>
                </div>
              ))}
            </VStack>
          )}
        </VStack>
      )}

      <VStack gap={10} fullWidth>
        <Typo.SM size={14}>Scene Summary</Typo.SM>
        <div className={s.summaryGrid}>
          <div className={s.metricCard}>
            <Typo.BD size={20}>{inspection.summary.totalObjects}</Typo.BD>
            <Typo.MD size={12} color="secondary">Total Objects</Typo.MD>
          </div>
          <div className={s.metricCard}>
            <Typo.BD size={20}>{inspection.summary.meshCount}</Typo.BD>
            <Typo.MD size={12} color="secondary">Meshes</Typo.MD>
          </div>
          <div className={s.metricCard}>
            <Typo.BD size={20}>{inspection.summary.groupCount}</Typo.BD>
            <Typo.MD size={12} color="secondary">Groups</Typo.MD>
          </div>
          <div className={s.metricCard}>
            <Typo.BD size={20}>{inspection.summary.maxDepth}</Typo.BD>
            <Typo.MD size={12} color="secondary">Tree Depth</Typo.MD>
          </div>
        </div>
      </VStack>

      <VStack gap={10} fullWidth>
        <Typo.SM size={14}>Selected Object Insight</Typo.SM>
        {inspection.selectedObject ? (
          <VStack className={s.sectionCard} gap={8} fullWidth>
            <HStack justify="between" align="center" fullWidth>
              <Typo.BD size={14}>{inspection.selectedObject.name}</Typo.BD>
              <span className={s.tagBadge}>{inspection.selectedObject.tag}</span>
            </HStack>
            <Typo.MD size={12} color="secondary">
              Type: {inspection.selectedObject.type}
            </Typo.MD>
            <Typo.MD size={12}>{inspection.selectedObject.note}</Typo.MD>
          </VStack>
        ) : (
          <VStack className={s.sectionCard} gap={8} fullWidth>
            <Typo.MD size={12} color="secondary">
              오브젝트를 선택하면 현재 코어 엔진이 추론 가능한 태그와 최적화 힌트를 보여줍니다.
            </Typo.MD>
          </VStack>
        )}
      </VStack>

      <VStack gap={10} fullWidth>
        <Typo.SM size={14}>Optimization Opportunities</Typo.SM>
        {inspection.recommendations.length > 0 ? (
          inspection.recommendations.map((recommendation) => (
            <VStack key={recommendation.id} className={s.sectionCard} gap={10} fullWidth>
              <HStack justify="between" align="center" fullWidth>
                <Typo.BD size={14}>{recommendation.title}</Typo.BD>
                <span className={[s.severityBadge, s[recommendation.severity]].join(' ')}>
                  {recommendation.severity}
                </span>
              </HStack>
              <Typo.MD size={12}>{recommendation.description}</Typo.MD>
              {recommendation.objectNames && recommendation.objectNames.length > 0 && (
                <Typo.MD size={12} color="secondary">
                  대상: {recommendation.objectNames.join(', ')}
                </Typo.MD>
              )}
              {recommendation.actionLabel && (
                <button
                  className={s.actionButton}
                  onClick={() => handleApplyRecommendation(recommendation.groupName, recommendation.objectNames)}
                >
                  {recommendation.actionLabel}
                </button>
              )}
            </VStack>
          ))
        ) : (
          <VStack className={s.sectionCard} gap={8} fullWidth>
            <Typo.MD size={12} color="secondary">
              현재 씬에서는 즉시 적용할 구조 최적화 후보가 보이지 않습니다.
            </Typo.MD>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}
