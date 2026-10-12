import { edgeKey } from './geometry.js';

const diamond = [{ x: 180, y: 40 }, { x: 310, y: 150 }, { x: 180, y: 260 }, { x: 50, y: 150 }];

export const guideExamples = [
  {
    id: 'three-move-endgame', page: '/strategy', dots: diamond,
    edges: [[0, 1], [1, 2]], choices: [[0, 2], [1, 3]], expected: [1, 0],
    continuations: [[[0, 3], [2, 3]], [[2, 3], [0, 3]]],
    finalScores: [{ 1: 2, 2: 0 }, { 1: 1, 2: 1 }],
    ko: {
      title: '세 수 앞까지: 대각선 선택으로 달라지는 최종 점수',
      setup: 'AB와 BC만 연결된 0 대 0의 판입니다. AC로 삼각형을 만들거나 BD로 반대쪽 대각선을 먼저 차지할 수 있습니다. 한 수의 점수와 남은 두 수를 함께 계산해 보세요.',
      question: 'AC와 BD 중 최종 점수가 더 좋은 선택은 무엇일까요?',
      answers: ['AC는 ABC를 완성해 즉시 1점을 얻습니다. 상대가 AD를 그으면 0점이고, 내가 CD로 ACD를 완성하면 2 대 0으로 끝납니다. 상대가 CD부터 그어도 내가 AD로 마지막 삼각형을 완성하므로 결과는 같습니다.', 'BD는 0점이고 AC를 교차로 막습니다. 상대가 CD로 BCD를 완성해 1점을 얻고, 내가 AD로 ABD를 완성하면 1 대 1입니다. 상대가 AD부터 선택해도 남은 CD로 내가 1점을 얻어 비깁니다.'],
      takeaway: '이 판에서는 AC가 승리를, BD가 무승부를 만듭니다. 대각선이 막는 선뿐 아니라 상대 차례 이후 마지막 변을 누가 그리는지까지 세어 보세요.',
    },
    en: {
      title: 'Three moves ahead: which diagonal wins the endgame?',
      setup: 'Only AB and BC exist, with scores at 0–0. Capture with AC or occupy the other diagonal with BD. Compare the immediate score and the two moves left afterward.',
      question: 'Which choice gives the better final score: AC or BD?',
      answers: ['AC completes ABC for 1 point. The opponent draws AD for 0, then your CD completes ACD to finish 2–0. If the opponent draws CD first, your AD captures the last triangle for the same result.', 'BD scores 0 and blocks AC by crossing. The opponent draws CD to capture BCD for 1, then your AD captures ABD to finish 1–1. If the opponent draws AD first, your remaining CD also gives a draw.'],
      takeaway: 'AC wins this board; BD draws. Count who closes the last side after the opponent’s turn, as well as which lines a diagonal blocks.',
    },
  },
  {
    id: 'first-capture', page: '/how-to-play',
    dots: [{ x: 70, y: 240 }, { x: 180, y: 50 }, { x: 290, y: 240 }],
    edges: [[0, 1], [1, 2]], choices: [[0, 2]], expected: [1],
    ko: {
      title: '마지막 한 변을 그으면 누구의 땅일까요?',
      setup: 'AB와 BC가 이미 연결되어 있습니다. A와 C를 연결해 ABC를 완성해 보세요. 기존 선을 누가 그었는지는 점수에 영향을 주지 않습니다.',
      question: '삼각형을 완성하는 선을 선택하세요.',
      answers: ['AC를 그은 플레이어가 ABC로 1점을 얻습니다. 득점하더라도 추가 차례는 없습니다. 이 작은 예제는 남은 선이 없어 즉시 끝나지만, 선이 남아 있는 실제 판에서는 상대 차례가 됩니다.'],
      takeaway: '영역의 넓이는 점수와 무관합니다. 작은 삼각형도 큰 삼각형도 새로 완성하면 각각 1점입니다.',
    },
    en: {
      title: 'Who owns the triangle when its last side closes?',
      setup: 'AB and BC already exist. Connect A to C to complete ABC. It does not matter who drew the existing sides.',
      question: 'Choose the line that completes the triangle.',
      answers: ['Drawing AC scores 1 point for ABC. Capturing does not grant an extra turn. This tiny board ends because no lines remain; on a larger board with legal moves, the opponent plays next.'],
      takeaway: 'Area does not affect the score. Each newly completed triangle is worth 1 point, large or small.',
    },
  },
  {
    id: 'crossing', page: '/how-to-play', dots: diamond,
    edges: [[0, 2]], choices: [[1, 3], [0, 1]], expected: [null, 0],
    ko: {
      title: '교차하는 선과 점을 공유하는 선의 차이',
      setup: '세로 선 AC가 있습니다. BD는 그 선의 중간을 가로지르고, AB는 끝점 A에서 만납니다.',
      question: 'BD와 AB 중 그을 수 있는 선은 무엇일까요?',
      answers: ['BD는 AC와 중간에서 교차하므로 그을 수 없습니다. 잘못된 선을 선택해도 점수와 차례는 바뀌지 않습니다.', 'AB는 기존 선과 끝점 A만 공유하므로 그을 수 있습니다. 아직 세 변이 연결되지 않았으므로 0점이고 다음은 상대 차례입니다.'],
      takeaway: '선들이 같은 점에서 만나는 것은 허용됩니다. 서로 다른 끝점을 가진 두 선이 중간에서 교차하는 것은 허용되지 않습니다.',
    },
    en: {
      title: 'Crossing a line versus sharing an endpoint',
      setup: 'AC is already drawn vertically. BD crosses its middle, while AB meets it only at A.',
      question: 'Which line is allowed: BD or AB?',
      answers: ['BD crosses AC and is rejected. An invalid selection changes neither the score nor the turn.', 'AB shares only endpoint A with AC, so it is legal. It scores 0 because no triangle is complete, then the opponent plays.'],
      takeaway: 'Lines may meet at the same dot. Lines with different endpoints cannot cross in their interiors.',
    },
  },
  {
    id: 'through-dot', page: '/how-to-play',
    dots: [{ x: 50, y: 150 }, { x: 180, y: 150 }, { x: 310, y: 150 }],
    edges: [], choices: [[0, 2], [0, 1]], expected: [null, 0],
    ko: {
      title: '중간의 점을 건너뛸 수는 없어요',
      setup: 'A와 C 사이에 B가 놓여 있습니다. 한 번에 AC를 연결하는 것과 AB를 연결하는 것은 다르게 판정됩니다.',
      question: '중간 점을 지나지 않는 선을 골라보세요.',
      answers: ['AC는 중간의 B를 통과하므로 그을 수 없습니다. 정확히 관통하지 않더라도 다른 점에 너무 가까운 선은 거절됩니다.', 'AB는 다른 점을 통과하지 않으므로 가능합니다. 나중에 BC도 별도의 차례에 그을 수 있지만, 세 점이 일직선이므로 삼각형은 만들어지지 않습니다.'],
      takeaway: '긴 선이 거절되면 양 끝점 사이에 다른 점이 있는지 살펴보세요. 그 점까지 짧게 연결하는 방법을 고려할 수 있습니다.',
    },
    en: {
      title: 'You cannot skip over a dot',
      setup: 'B lies between A and C. Drawing AC in one move is different from drawing AB.',
      question: 'Choose a line that does not pass through another dot.',
      answers: ['AC passes through B and is rejected. A line passing too close to another dot is also rejected.', 'AB is legal. BC can be drawn on a later turn, but these three collinear dots cannot form a triangle.'],
      takeaway: 'When a long line is rejected, look for dots between its endpoints. Consider a shorter connection to one of those dots.',
    },
  },
  {
    id: 'double-capture', page: '/strategy', dots: diamond,
    edges: [[0, 1], [1, 2], [2, 3], [3, 0]], choices: [[0, 2], [1, 3]], expected: [2, 2],
    ko: {
      title: '한 선으로 2점을 얻는 공통 마지막 변',
      setup: '마름모의 바깥 네 변이 모두 연결되어 있습니다. 아직 안쪽에는 선이 없습니다. 두 대각선을 각각 시험해 보세요.',
      question: 'AC와 BD는 각각 몇 점을 만들까요?',
      answers: ['AC는 ABC와 ACD를 동시에 완성해 2점을 얻습니다. AC 양쪽에 있던 두 열린 삼각형의 마지막 변을 한꺼번에 채운 것입니다.', 'BD도 ABD와 BCD를 동시에 완성해 2점을 얻습니다. 이 판에서는 두 선택의 점수가 같습니다. 먼저 한 대각선을 그으면 나머지 대각선은 교차 때문에 그을 수 없어 게임이 끝납니다.'],
      takeaway: '한쪽 삼각형만 보지 말고 후보 선의 양쪽을 확인하세요. 단, 바깥 네 변 중 하나가 빠져 있으면 결과가 달라집니다. 다음 예제에서 비교해 보세요.',
    },
    en: {
      title: 'Two points from one shared final side',
      setup: 'All four outer sides of the diamond exist, with no line inside. Try each diagonal independently.',
      question: 'How many points do AC and BD each score?',
      answers: ['AC completes both ABC and ACD for 2 points. It fills the shared missing side of two open triangles.', 'BD also scores 2 points, for ABD and BCD. Both choices are equal here. Drawing either diagonal blocks the other by crossing, ending this board.'],
      takeaway: 'Check both sides of a candidate line. The result changes if an outer edge is missing, as the next example shows.',
    },
  },
  {
    id: 'reply', page: '/strategy', dots: diamond,
    edges: [[0, 1], [1, 2], [2, 3]], choices: [[0, 2], [0, 3]], expected: [1, 0], replies: [[0, 3], [0, 2]],
    ko: {
      title: '바깥 테두리를 완성하면 오히려 손해인 상황',
      setup: '이번에는 AB·BC·CD만 연결되어 있고 AD가 비어 있습니다. 현재 점수는 0 대 0입니다. AC로 먼저 득점할지, AD로 테두리를 닫을지 비교해 보세요.',
      question: '내 수와 상대의 다음 수를 함께 비교하세요.',
      answers: ['AC를 그으면 ABC로 내가 1점을 얻습니다. 상대가 남은 AD를 그어 ACD로 1점을 얻으면 1 대 1로 끝납니다. 득점 후에도 차례가 넘어가므로 두 영역을 모두 내 것으로 만들 수는 없습니다.', 'AD를 그으면 아직 삼각형이 없어 나는 0점입니다. 상대가 AC를 그으면 두 삼각형을 완성해 2점을 얻고, 0 대 2로 끝납니다. 테두리를 완성하는 수가 상대의 득점을 준비해 준 셈입니다.'],
      takeaway: '이 판에서는 AC가 AD보다 낫습니다. 이것을 “항상 먼저 득점하라”는 규칙으로 일반화하지 마세요. 큰 판에서는 다른 영역의 득점 기회와 다음 차례에 가능한 선도 비교해야 합니다.',
    },
    en: {
      title: 'When closing the outside helps your opponent',
      setup: 'Only AB, BC, and CD exist; AD is missing. Scores start at 0–0. Compare capturing with AC against closing the boundary with AD.',
      question: 'Compare your move together with the opponent’s reply.',
      answers: ['AC gives you 1 point for ABC. The opponent draws the remaining AD for ACD and 1 point, ending 1–1. Scoring passes the turn, so you cannot take both regions yourself.', 'AD scores 0 because no triangle closes. The opponent draws AC for 2 points, ending 0–2. Completing the boundary prepared a double capture for the opponent.'],
      takeaway: 'AC is better than AD here. This is not a universal rule to capture immediately: larger boards require comparing scoring opportunities elsewhere and the remaining legal moves.',
    },
  },
];

export function createExampleState(example) {
  return {
    dots: example.dots,
    edges: new Map(example.edges.map(([a, b]) => [edgeKey(a, b), { a, b, player: 2 }])),
    claimed: new Map(), scores: { 1: 0, 2: 0 }, currentPlayer: 1,
    selected: null, gameOver: false, lastMoveKey: null, moveCount: 0, notice: null,
  };
}
