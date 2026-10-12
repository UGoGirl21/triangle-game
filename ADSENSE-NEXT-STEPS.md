# 재신청 전에 확인할 것

## 계정에서 직접 확인

1. Google Search Console에서 `https://triangle-game-one.vercel.app/` 속성을 선택합니다. HTML에 소유권 확인 태그는 있지만, 계정에서 확인이 완료됐는지는 별도로 확인해야 합니다.
2. 사이트맵 메뉴에서 `https://triangle-game-one.vercel.app/sitemap.xml`의 제출 상태와 읽기 오류를 확인합니다. 아직 제출하지 않았다면 제출합니다.
3. URL 검사에서 홈, `/how-to-play`, `/strategy`, `/daily-challenge`를 각각 검사합니다. ‘실제 URL 테스트’에서 가져오기와 색인 허용 여부를 확인하고, 업데이트된 페이지는 색인 생성을 요청합니다.
4. 검사 결과에 오류가 있으면 URL과 오류 문구를 공유합니다. 사이트에 접속할 수 있다는 것과 Google에 색인됐다는 것은 별개의 상태입니다. 검색 색인 완료 자체가 AdSense 승인을 보장하지도 않습니다.
5. AdSense의 사이트 상세 화면에서 반려 사유 전체와 추가로 표시된 문제를 확인합니다. 해당 문구를 공유하면 실제 심사 문제에 맞춰 후속 개선을 할 수 있습니다.

Google 안내: [URL 검사 도구](https://support.google.com/webmasters/answer/9012289?hl=ko), [다시 크롤링 요청](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl?hl=ko), [반려된 사이트 개선](https://support.google.com/adsense/answer/81904?hl=ko).

## 실제 플레이 반응 확인

몇 명에게 게임 링크를 보내고 다음 세 가지를 물어봅니다. 인원수는 심사 조건이 아닙니다.

- 별도 설명 없이 첫 삼각형을 만들 수 있었나요? 막혔다면 어느 화면이었나요?
- 한 판을 끝낼 수 있었나요? 기기와 브라우저, 불편한 조작을 알려주세요.
- 다시 플레이하고 싶나요? 원한다면 그 이유, 아니라면 부족한 점을 알려주세요.

이 피드백을 반영한 후 재신청합니다. 페이지 수나 글자 수를 맞추기 위해 반복적인 글을 추가하거나, 승인만을 위해 방문자 수를 구매할 필요는 없습니다. 독립 도메인 구매는 이번 개선의 필수 항목이 아닙니다. 승인이나 수익은 보장되지 않습니다.

## 개발 검증

`npm run lint` → `npm run build` → `npm run check:guides`로 문법, 예제의 실제 게임 결과, 초기 HTML의 안내 내용을 확인합니다.

배포 후 `npm run check:site`로 공개 주소의 9개 페이지와 robots.txt, sitemap.xml, ads.txt를 확인합니다. 이 검사는 로그인한 Search Console이나 AdSense 계정의 심사 상태를 확인하지 않습니다.
