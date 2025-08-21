# Chrome Extension 배포 체크리스트

## ✅ 준비 완료 항목

### 1. 파일 준비
- [x] manifest.json (Manifest V3)
- [x] background.js (서비스 워커)
- [x] content_script.js (콘텐츠 스크립트)
- [x] popup.html & popup.js (팝업 UI)
- [x] 아이콘 파일들 (16px, 48px, 128px)
- [x] chrome-extension.zip 파일 생성 완료

### 2. 개발자 계정
- [ ] Chrome Web Store 개발자 계정 생성
- [ ] $5 등록비 지불 완료

### 3. 스토어 등록 정보
- [ ] 확장 프로그램 이름: "Image Reference Copy"
- [ ] 간단한 설명 (132자 이내)
- [ ] 상세한 설명 작성
- [ ] 카테고리: Productivity
- [ ] 언어: English

### 4. 시각적 자료
- [ ] 스크린샷 1-5개 (1280x800 해상도)
- [ ] 프로모션 이미지 (440x280px)
- [ ] 아이콘 이미지들

### 5. 법적 요구사항
- [ ] 개인정보처리방침 URL (필요시)
- [ ] 라이선스 정보 확인

## 📋 배포 단계

### 1단계: Chrome Web Store 접속
- https://chrome.google.com/webstore/devconsole/
- Google 계정으로 로그인

### 2단계: 새 항목 추가
- "Add new item" 클릭
- chrome-extension.zip 파일 업로드

### 3단계: 스토어 정보 입력
- 확장 프로그램 이름
- 설명 (간단/상세)
- 카테고리 및 언어
- 스크린샷 및 프로모션 이미지

### 4단계: 검토 및 제출
- 모든 정보 확인
- "Submit for review" 클릭

### 5단계: 심사 대기
- Google 심사 기간: 보통 1-3일
- 승인 후 Chrome Web Store에 게시

## ⚠️ 주의사항

1. **권한 최소화**: 필요한 권한만 요청
2. **개인정보 보호**: 사용자 데이터 수집 시 개인정보처리방침 필수
3. **정확한 설명**: 기능과 실제 동작이 일치해야 함
4. **고품질 스크린샷**: 명확하고 전문적인 이미지 사용
5. **테스트 완료**: 배포 전 모든 기능 테스트

## 🔗 유용한 링크

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
- [Chrome Extension 개발 가이드](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 마이그레이션 가이드](https://developer.chrome.com/docs/extensions/mv3/intro/)
