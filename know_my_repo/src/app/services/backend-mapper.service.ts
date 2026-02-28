import type { BackendAnalyzeResponse } from '../models/backend-response.model';
import type { AnalysisResult, ExplainResult } from '../models';

/**
 * Maps backend POST /api/analyze response to frontend AnalysisResult + ExplainResult.
 * Supports Frontend, Backend, ML, Spring Boot, and Fullstack/Monorepo projects.
 */
export function mapBackendToFrontend(raw: BackendAnalyzeResponse): {
  analysis: AnalysisResult;
  explain: ExplainResult;
} {
  const {
    repoUrl,
    language,
    projectType,
    framework,
    architecture,
    entryPoint,
    routes,
    controllers,
    models,
    services,
    applicationConfig,
    frontendModules,
    mlModules,
    readmeSummary,
    explanation,
  } = raw;
  const repoId = repoUrl;

  const coreComponents: string[] = [
    ...(controllers?.map((c) => c.name) ?? []),
    ...(models?.map((m) => m.name) ?? []),
    ...(services?.map((s) => s.name) ?? []),
  ].filter(Boolean);

  if (frontendModules?.length) {
    const fe = frontendModules[0];
    if (fe.components?.length) coreComponents.push(...fe.components.map((p) => p.split('/').pop() ?? p).slice(0, 30));
    if (fe.pages?.length) coreComponents.push(...fe.pages.map((p) => p.split('/').pop() ?? p).slice(0, 20));
  }

  const layers: { name: string; components: string[]; description?: string }[] = [
    ...(controllers?.length
      ? [{ name: 'Controllers', components: controllers.map((c) => c.name), description: 'Request handlers' }]
      : []),
    ...(services?.length
      ? [{ name: 'Services', components: services.map((s) => s.name), description: 'Business logic (Spring Boot)' }]
      : []),
    ...(models?.length ? [{ name: 'Models', components: models.map((m) => m.name), description: 'Data models / Entities' }] : []),
  ];

  if (frontendModules?.length) {
    const fe = frontendModules[0];
    if (fe.components?.length || fe.pages?.length) {
      const comps = [
        ...(fe.components?.slice(0, 20) ?? []),
        ...(fe.pages?.slice(0, 15) ?? []),
      ].map((p) => p.split('/').pop() ?? p);
      layers.push({ name: 'UI Components', components: comps, description: `${fe.framework ?? 'Frontend'} – render: ${fe.renderMode ?? 'SPA'}` });
    }
  }

  if (mlModules?.length && mlModules[0].libs?.length) {
    const ml = mlModules[0];
    layers.push({
      name: 'ML Pipeline',
      components: [
        ...(ml.trainingScripts?.slice(0, 5) ?? []),
        ...(ml.inferenceScripts?.slice(0, 3) ?? []),
        ...(ml.libs ?? []),
      ],
      description: `Libs: ${ml.libs?.join(', ') ?? '—'}`,
    });
  }

  const workflows: { name: string; description?: string }[] = routes?.map((r) => ({
    name: `${r.method} ${r.path}`.trim(),
    description: r.handler ? `Handler: ${r.handler}` : undefined,
  })) ?? [];

  if (frontendModules?.length && frontendModules[0].routes?.length) {
    frontendModules[0].routes.slice(0, 25).forEach((r) => {
      workflows.push({ name: r.path || '/', description: r.component ? `→ ${r.component}` : r.type });
    });
  }

  if (mlModules?.length && mlModules[0].trainingScripts?.length) {
    workflows.push({ name: 'Training', description: mlModules[0].trainingScripts.slice(0, 3).join(', ') });
  }
  if (mlModules?.length && mlModules[0].inferenceScripts?.length) {
    workflows.push({ name: 'Inference', description: mlModules[0].inferenceScripts.slice(0, 2).join(', ') });
  }

  const importantFiles: { path: string; importance: number; label?: string }[] = [
    ...(routes?.filter((r) => r.sourceFile).map((r) => ({ path: r.sourceFile!, importance: 85, label: `${r.method} ${r.path}` })) ?? []),
    ...(controllers?.filter((c) => c.file).map((c) => ({ path: c.file!, importance: 80, label: c.name })) ?? []),
    ...(services?.filter((s) => s.file).map((s) => ({ path: s.file!, importance: 75, label: s.name })) ?? []),
    ...(models?.filter((m) => m.file).map((m) => ({ path: m.file!, importance: 70, label: m.name })) ?? []),
  ];

  if (frontendModules?.length) {
    frontendModules[0].pages?.slice(0, 15).forEach((p) => importantFiles.push({ path: p, importance: 65, label: p.split('/').pop() ?? p }));
    frontendModules[0].components?.slice(0, 10).forEach((p) => importantFiles.push({ path: p, importance: 60, label: p.split('/').pop() ?? p }));
  }
  if (mlModules?.length) {
    mlModules[0].trainingScripts?.slice(0, 5).forEach((p) => importantFiles.push({ path: p, importance: 75, label: 'train' }));
    mlModules[0].notebooks?.slice(0, 5).forEach((p) => importantFiles.push({ path: p, importance: 70, label: 'notebook' }));
  }

  const analysis: AnalysisResult = {
    repoId,
    projectType: projectType ?? language ?? undefined,
    architectureStyle: architecture ?? undefined,
    entryPoint: entryPoint ?? undefined,
    frameworks: framework ? [framework] : undefined,
    database: models?.length
      ? models.map((m) => (m.schemaSummary ? `${m.name}: ${m.schemaSummary}` : m.name)).join('; ')
      : undefined,
    executionFlow: explanation?.executionFlow ?? undefined,
    coreComponents: [...new Set(coreComponents)].filter(Boolean),
    routeTraces: routes?.map((r) => ({
      route: `${r.method} ${r.path}`.trim(),
      controller: r.handler ?? undefined,
    })),
    layers: layers.length ? layers : undefined,
    workflows: workflows.length ? workflows : undefined,
    importantFiles: importantFiles.length ? importantFiles : undefined,
  };

  const sections: { title: string; content: string }[] = [];

  if (explanation?.folderTreeText) {
    sections.push({ title: 'Folder Structure', content: explanation.folderTreeText });
  } else if (raw.folderTreeText) {
    sections.push({ title: 'Folder Tree', content: raw.folderTreeText });
  }

  if (explanation?.executionFlow) {
    sections.push({ title: 'Execution Flow', content: explanation.executionFlow });
  }

  if (applicationConfig) {
    sections.push({ title: 'Application Config (Spring Boot)', content: applicationConfig });
  }

  if (frontendModules?.length) {
    const fe = frontendModules[0];
    let feContent = `Framework: ${fe.framework ?? '—'}\nRender: ${fe.renderMode ?? 'SPA'}\n`;
    if (fe.stateManagement?.length && fe.stateManagement[0] !== 'None detected') {
      feContent += `State: ${fe.stateManagement.join(', ')}\n`;
    }
    if (fe.routes?.length) {
      feContent += `\nRoutes (${fe.routes.length}):\n${fe.routes.slice(0, 20).map((r) => `  ${r.path} → ${r.component || r.file || ''}`).join('\n')}`;
    }
    sections.push({ title: 'Frontend Analysis', content: feContent });
  }

  if (mlModules?.length && mlModules[0].libs?.length) {
    const ml = mlModules[0];
    let mlContent = `Libs: ${(ml.libs ?? []).join(', ')}\n`;
    if (ml.pipelineExplanation) mlContent += `\n${ml.pipelineExplanation}`;
    sections.push({ title: 'ML Pipeline', content: mlContent });
  }

  if (readmeSummary) {
    sections.push({ title: 'README Summary', content: readmeSummary });
  }

  const explain: ExplainResult = {
    repoId,
    summary: explanation?.summary ?? readmeSummary ?? undefined,
    sections,
  };

  return { analysis, explain };
}
