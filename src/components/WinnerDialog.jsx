export default function WinnerDialog({ message, onPlayAgain }) {
  return <div className="overlay show"><div className="dialog-box winner-box">
    <h2>게임 종료!</h2><p>{message} 더 그을 수 있는 선이 없습니다.</p>
    <button type="button" onClick={onPlayAgain}>다시 하기</button>
  </div></div>;
}
