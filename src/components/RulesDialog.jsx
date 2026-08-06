export default function RulesDialog({ onClose }) {
  return <div className="overlay show"><div className="dialog-box rules-box">
    <h2>게임 방법</h2>
    <div className="rules-content">
      1. 점을 탭해 선택<br />
      2. 다른 점을 탭해 선 긋기<br />
      3. 점과 점은 직선으로만 연결<br />
      4. 선이 서로 교차할 순 없음<br />
      5. 완성한 모든 삼각형은 점수 획득<br />
      6. 노란 선은 가장 최근에 둔 수<br />
      7. 더 그을 선이 없으면 게임 종료
    </div>
    <button type="button" onClick={onClose}>닫기</button>
  </div></div>;
}
