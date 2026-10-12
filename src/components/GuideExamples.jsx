import { useId, useState } from 'react';
import { useLocale } from '../i18n/LocaleContext.js';
import { applyMove } from '../game/gameLogic.js';
import { createExampleState, guideExamples } from '../game/guideExamples.js';

const name = (i) => String.fromCharCode(65 + i);
const lineName = ([a, b]) => `${name(a)}${name(b)}`;

function Example({ example, locale }) {
  const [choice, setChoice] = useState(null);
  const [showReply, setShowReply] = useState(false);
  const [continuationStep, setContinuationStep] = useState(0);
  const titleId = useId();
  const ko = locale === 'ko';
  const copy = example[ko ? 'ko' : 'en'];
  const initial = createExampleState(example);
  const after = choice === null ? initial : applyMove(initial, ...example.choices[choice]);
  const reply = choice === null ? null : example.replies?.[choice];
  const continuation = choice === null ? [] : example.continuations?.[choice] || [];
  const state = continuation.length
    ? continuation.slice(0, continuationStep).reduce((current, move) => applyMove(current, ...move), after)
    : showReply && reply ? applyMove(after, ...reply) : after;
  const invalid = choice !== null && after === initial;
  const preview = choice === null ? null : example.choices[choice];
  const segment = ([a, b], { key, ...props }) => <line key={key} x1={example.dots[a].x} y1={example.dots[a].y}
    x2={example.dots[b].x} y2={example.dots[b].y} {...props} />;

  return <article className="guide-example" aria-labelledby={titleId}>
    <h3 id={titleId}>{copy.title}</h3>
    <p>{copy.setup}</p>
    <div className="guide-example-layout">
      <figure>
        <svg viewBox="0 0 360 300" role="img" aria-label={`${copy.title}. ${copy.setup}`}>
          {Array.from(state.claimed.values()).map((tri) => <polygon key={`${tri.a}-${tri.b}-${tri.c}`}
            points={[tri.a, tri.b, tri.c].map((i) => `${example.dots[i].x},${example.dots[i].y}`).join(' ')}
            fill={tri.player === 1 ? '#e3c8f5' : '#ffe6a1'} />)}
          {Array.from(state.edges.values()).map(({ a, b }) => segment([a, b], { key: `${a}-${b}`, stroke: '#453448', strokeWidth: 4 }))}
          {preview && segment(preview, { stroke: invalid ? '#a52a14' : '#713c95', strokeWidth: 5, strokeDasharray: '9 6' })}
          {showReply && reply && segment(reply, { stroke: '#936000', strokeWidth: 5, strokeDasharray: '3 5' })}
          {example.dots.map(({ x, y }, i) => <g key={i}><circle cx={x} cy={y} r="7" fill="#453448" />
            <text x={x + 13} y={y - 12} fill="#453448" fontSize="20" fontWeight="700">{name(i)}</text></g>)}
        </svg>
        <figcaption>{ko ? '실선: 기존 선 · 긴 점선: 내 선택 · 짧은 점선: 상대의 수' : 'Solid: existing lines · long dashes: your choice · short dashes: opponent’s reply'}</figcaption>
      </figure>
      <div>
        <p>{copy.question}</p>
        <div className="guide-actions" role="group" aria-label={copy.question}>
          {example.choices.map((move, i) => <button type="button" key={lineName(move)} aria-pressed={choice === i}
            onClick={() => { setChoice(i); setShowReply(false); setContinuationStep(0); }}>{lineName(move)} {ko ? '그어보기' : '— try move'}</button>)}
          <button type="button" onClick={() => { setChoice(null); setShowReply(false); setContinuationStep(0); }}>{ko ? '처음으로' : 'Reset'}</button>
        </div>
        <div className="guide-result" role="status" aria-live="polite" aria-atomic="true">
          {choice === null ? <p>{ko ? '각 선택은 같은 시작 상태에서 비교합니다.' : 'Each choice starts from the same position.'}</p> : <>
            <p><strong>{ko ? `나 ${state.scores[1]} : 상대 ${state.scores[2]}` : `You ${state.scores[1]} : Opponent ${state.scores[2]}`}</strong>
              {invalid ? (ko ? ' · 그을 수 없는 선' : ' · Invalid line') : state.gameOver ? (ko ? ' · 게임 종료' : ' · Game over') : (ko ? ` · 다음 차례: ${state.currentPlayer === 1 ? '나' : '상대'}` : ` · Next: ${state.currentPlayer === 1 ? 'you' : 'opponent'}`)}</p>
            <p>{copy.answers[choice]}</p>
          </>}
        </div>
        {reply && !showReply && <button type="button" onClick={() => setShowReply(true)}>{ko ? `상대의 ${lineName(reply)}도 보기` : `Show opponent’s ${lineName(reply)}`}</button>}
        {continuation.length > 0 && <div className="guide-actions">
          {continuationStep < continuation.length && <button type="button" onClick={() => setContinuationStep(continuationStep + 1)}>
            {ko ? `${continuationStep === 0 ? '상대' : '나'}의 ${lineName(continuation[continuationStep])} 보기` : `Show ${continuationStep === 0 ? 'opponent’s' : 'your'} ${lineName(continuation[continuationStep])}`}
          </button>}
          <p>{ko ? `이후 진행: ${continuation.map(lineName).join(' → ')} · ${continuationStep}/${continuation.length}수 확인` : `Continuation: ${continuation.map(lineName).join(' → ')} · ${continuationStep}/${continuation.length} moves shown`}</p>
        </div>}
      </div>
    </div>
    <details><summary>{ko ? '모든 선택의 해설 읽기' : 'Read the explanation for every choice'}</summary>
      {copy.answers.map((answer, i) => <p key={answer}><strong>{lineName(example.choices[i])}: </strong>{answer}</p>)}
    </details>
    <p className="guide-takeaway">{copy.takeaway}</p>
  </article>;
}

export default function GuideExamples({ path }) {
  const { locale } = useLocale();
  const examples = guideExamples.filter((example) => example.page === path);
  if (!examples.length) return null;
  const ko = locale === 'ko';
  return <section className="guide-examples" aria-labelledby="examples-title">
    <h2 id="examples-title">{ko ? '작은 게임판으로 직접 확인하기' : 'Try it on a small board'}</h2>
    <p>{ko ? '규칙을 비교하기 위해 점 수를 줄인 연습판입니다. 선을 선택하거나 아래 해설을 펼쳐 결과를 확인하세요.' : 'These practice boards use fewer dots to make the rules clear. Choose a line or expand the explanations below.'}</p>
    {examples.map((example) => <Example key={example.id} example={example} locale={locale} />)}
    <nav className="guide-links" aria-label={ko ? '다음 단계' : 'Next steps'}>
      <a href={path === '/strategy' ? '/how-to-play' : '/strategy'}>{ko ? (path === '/strategy' ? '게임 규칙 다시 보기' : '다음: 실전 전략 예제') : (path === '/strategy' ? 'Review the rules' : 'Next: strategy examples')}</a>
      <a href="/">{ko ? '게임에서 연습하기' : 'Practice in the game'}</a>
    </nav>
  </section>;
}
