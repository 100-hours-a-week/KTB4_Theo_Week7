function WithdrawalPanel({ onRequest }) {
  return (
    <div className="withdrawal-panel">
      <strong>코드 한입을 떠나시나요?</strong>
      <p>회원 탈퇴 시 모든 데이터가 삭제됩니다.</p>
      <button
        type="button"
        className="withdrawal-button"
        onClick={onRequest}
      >
        회원 탈퇴
      </button>
    </div>
  )
}

export default WithdrawalPanel
