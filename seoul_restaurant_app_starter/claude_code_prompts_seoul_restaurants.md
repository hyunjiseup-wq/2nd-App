## Claude Code 프롬프트: 서울 맛집 리스트 앱 생성

다음 프롬프트를 Claude Code에 제공하면 새롭게 **서울 맛집 리스트 앱**을 생성하는 데 도움이 됩니다. 기존 Todo 앱을 변형하지 않고, 별도의 독립적인 맛집 앱을 만듭니다.

```
React Native/Expo를 이용해 서울 맛집 리스트 앱을 만들어줘.

기본 데이터 모델은 restaurants 테이블로 다음 필드를 가진다:
- id: uuid, 기본키, 자동생성
- name: text, 필수
- area: text
- category: text
- address: text
- naver_map_url: text
- tags: text[]
- memo: text
- visited: boolean, 기본값 false
- priority: integer, 기본값 3
- created_at: timestamp, 기본값 now()
- updated_at: timestamp, 기본값 now()

필수 기능:
- 서울 맛집 리스트 표시 (FlatList)
- 식당명/지역/메모 키워드 검색
- 지역별 필터 (e.g. 성수, 홍대, 을지로, 강남, 용산, 연남)
- 카테고리별 필터 (e.g. 한식, 일식, 중식, 양식, 카페, 술집)
- 방문함/가고싶음(visited) 필터
- 맛집 추가/수정/삭제
- 방문함 토글 (스와이프 또는 버튼)
- 상세보기 화면
- 네이버 지도 열기 버튼 (Linking.openURL)
- 모바일 반응형 UI

제약 조건:
- Expo CLI를 이용한 프로젝트 구조를 따르고, TypeScript를 사용한다.
- 로컬 JSON 파일을 초기 데이터로 사용한다 (예: restaurants_seed.json).
- 상태 관리는 React Context 또는 간단한 상태 훅(useState)을 사용한다. Redux는 사용하지 않는다.
- AsyncStorage를 이용해 로컬 저장소에 맛집 데이터를 저장하고 불러온다.
- UI 라이브러리는 Expo에 포함된 기본 컴포넌트(Pressable, TextInput 등)를 주로 사용한다.

README를 작성하고, 설치 및 실행 방법을 명확히 안내해줘. 사용자 친화적인 디자인과 모듈화된 폴더 구조를 구성해줘.
```

위 프롬프트는 맛집 리스트 앱을 새로 만드는 데 필요한 요구 사항을 명확히 명시합니다. 이 파일을 참고하여 Claude Code에 요청하면 적절한 프로젝트 구조와 코드가 생성될 것입니다.