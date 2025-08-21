# 권한 최적화 제안

## 현재 권한
```json
"permissions": ["contextMenus", "clipboardWrite", "activeTab", "scripting", "notifications", "tabs", "management"]
```

## 최적화된 권한 (권장)
```json
"permissions": ["contextMenus", "clipboardWrite", "activeTab", "scripting"]
```

## 제거 가능한 권한

### 1. notifications
- **이유**: 이미지 복사 완료 알림은 필수 기능이 아님
- **대안**: 팝업 UI에서 상태 메시지로 대체 가능

### 2. tabs
- **이유**: activeTab 권한으로 충분히 대체 가능
- **대안**: activeTab에서 현재 탭 정보만 가져오기

### 3. management
- **이유**: 확장 프로그램 관리 기능이 핵심 기능이 아님
- **대안**: chrome.storage API 사용 (권한 불필요)

## 최적화된 권한 사용 근거

### contextMenus
```
이미지 우클릭 시 "Copy for Figma" 메뉴를 제공하기 위해 필요합니다.
```

### clipboardWrite
```
이미지 참조 정보를 클립보드에 복사하기 위해 필요합니다.
```

### activeTab
```
현재 탭에서 이미지 정보를 추출하기 위해 필요합니다.
```

### scripting
```
Google Images 등에서 원본 이미지 URL을 찾기 위해 필요합니다.
```

## 권한 최소화의 장점
1. **심사 속도 향상**: 불필요한 권한으로 인한 지연 방지
2. **사용자 신뢰**: 최소한의 권한으로 보안성 강조
3. **승인 확률 증가**: Google의 권한 최소화 정책 준수
