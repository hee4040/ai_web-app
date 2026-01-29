-- ============================================================================
-- EnvRecipe (BUILD-HIGH) - 샘플 데이터 시드 스크립트
-- ============================================================================
-- 
-- [중요] 실행 전 필수 사항:
-- 1. Supabase Auth에서 아래 5개의 테스트 유저를 먼저 생성해야 합니다.
--    각 유저의 UUID는 아래 주석에 명시된 고정 UUID를 사용하세요.
--
--    테스트 유저 UUID 목록:
--    - 11111111-1111-1111-1111-111111111111 (김개발)
--    - 22222222-2222-2222-2222-222222222222 (박도커)
--    - 33333333-3333-3333-3333-333333333333 (이로봇)
--    - 44444444-4444-4444-4444-444444444444 (최쿠버)
--    - 55555555-5555-5555-5555-555555555555 (정파이)
--
-- 2. Supabase Dashboard > Authentication > Users에서
--    "Add user" 버튼을 클릭하여 위 UUID로 유저를 생성하세요.
--    또는 Supabase CLI를 사용하여 생성할 수 있습니다.
--
-- 3. 위 유저 생성이 완료된 후, 이 스크립트를 실행하세요.
--
-- ============================================================================

-- ============================================================================
-- 1. PROFILES (테스트용 유저 프로필)
-- ============================================================================

INSERT INTO public.profiles (id, display_name, avatar_url, updated_at) VALUES
  -- 김개발: Git 전문가
  ('11111111-1111-1111-1111-111111111111', '김개발', 'https://api.dicebear.com/7.x/avataaars/svg?seed=kimdev', now()),
  
  -- 박도커: Docker 전문가
  ('22222222-2222-2222-2222-222222222222', '박도커', 'https://api.dicebear.com/7.x/avataaars/svg?seed=docker', now()),
  
  -- 이로봇: ROS 전문가
  ('33333333-3333-3333-3333-333333333333', '이로봇', 'https://api.dicebear.com/7.x/avataaars/svg?seed=robot', now()),
  
  -- 최쿠버: Kubernetes 전문가
  ('44444444-4444-4444-4444-444444444444', '최쿠버', 'https://api.dicebear.com/7.x/avataaars/svg?seed=k8s', now()),
  
  -- 정파이: Python 전문가
  ('55555555-5555-5555-5555-555555555555', '정파이', 'https://api.dicebear.com/7.x/avataaars/svg?seed=python', now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. POSTS (환경 설정 레시피 게시글)
-- ============================================================================
-- Category ID: categories.name 기준 서브쿼리 사용 (하드코딩 없음)

-- 김개발의 게시글들
INSERT INTO public.posts (
  user_id, title, description, category_id, tags, 
  troubleshooting_raw, ai_summary, ai_keywords, troubleshooting_notes,
  is_public, like_count, created_at, updated_at
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Git 협업 워크플로우 설정하기',
    '팀 프로젝트에서 효과적인 Git 브랜치 전략과 협업 워크플로우를 설정하는 방법을 단계별로 설명합니다. feature 브랜치, pull request, 코드 리뷰 프로세스를 포함합니다.',
    (SELECT id FROM public.categories WHERE name = 'Git'),
    ARRAY['git', '협업', '브랜치전략', '워크플로우', 'pull-request'],
    '브랜치 충돌 시: git merge --abort로 취소 후 재시도',
    'Git 브랜치 전략과 협업 워크플로우 설정 가이드. feature 브랜치 활용과 PR 프로세스 설명.',
    ARRAY['git', '브랜치', '협업', '워크플로우'],
    '[]'::jsonb,
    true,
    12,
    '2025-01-15 10:30:00+09',
    '2025-01-15 10:30:00+09'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Git Hooks로 코드 품질 자동화',
    'pre-commit hook을 설정하여 코드 포맷팅, 린터 검사, 테스트 실행을 자동화하는 방법을 다룹니다.',
    (SELECT id FROM public.categories WHERE name = 'Git'),
    ARRAY['git', 'hooks', '자동화', 'pre-commit', '코드품질'],
    'hook 실행 권한 문제: chmod +x .git/hooks/pre-commit',
    'Git Hooks를 활용한 코드 품질 자동화 설정. pre-commit hook 구성 방법.',
    ARRAY['git', 'hooks', '자동화'],
    '[]'::jsonb,
    true,
    8,
    '2025-01-20 14:15:00+09',
    '2025-01-20 14:15:00+09'
  );

-- 박도커의 게시글들
INSERT INTO public.posts (
  user_id, title, description, category_id, tags,
  troubleshooting_raw, ai_summary, ai_keywords, troubleshooting_notes,
  is_public, like_count, created_at, updated_at
) VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    'Docker Compose로 개발 환경 구성하기',
    '로컬 개발 환경을 Docker Compose로 구성하여 데이터베이스, Redis, 백엔드 서버를 한 번에 실행하는 방법을 설명합니다.',
    (SELECT id FROM public.categories WHERE name = 'Docker'),
    ARRAY['docker', 'docker-compose', '개발환경', '로컬개발', '컨테이너'],
    '포트 충돌 시: docker-compose.yml에서 포트 번호 변경',
    'Docker Compose를 활용한 통합 개발 환경 구성 가이드.',
    ARRAY['docker', 'compose', '개발환경'],
    '[]'::jsonb,
    true,
    25,
    '2025-01-10 09:00:00+09',
    '2025-01-10 09:00:00+09'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Docker 멀티 스테이지 빌드 최적화',
    '프로덕션 이미지 크기를 최소화하기 위한 멀티 스테이지 빌드 전략과 베스트 프랙티스를 공유합니다.',
    (SELECT id FROM public.categories WHERE name = 'Docker'),
    ARRAY['docker', '멀티스테이지', '최적화', '이미지크기', '베스트프랙티스'],
    '빌드 캐시 활용: --cache-from 옵션 사용',
    'Docker 멀티 스테이지 빌드를 통한 이미지 크기 최적화 방법.',
    ARRAY['docker', '빌드', '최적화'],
    '[]'::jsonb,
    true,
    18,
    '2025-01-18 16:45:00+09',
    '2025-01-18 16:45:00+09'
  );

-- 이로봇의 게시글들
INSERT INTO public.posts (
  user_id, title, description, category_id, tags,
  troubleshooting_raw, ai_summary, ai_keywords, troubleshooting_notes,
  is_public, like_count, created_at, updated_at
) VALUES
  (
    '33333333-3333-3333-3333-333333333333',
    'ROS2 Humble 개발 환경 설정',
    'Ubuntu 22.04에서 ROS2 Humble을 설치하고 워크스페이스를 구성하는 완전한 가이드입니다.',
    (SELECT id FROM public.categories WHERE name = 'ROS'),
    ARRAY['ros2', 'humble', 'ubuntu', '설치', '워크스페이스'],
    'colcon 빌드 실패 시: source /opt/ros/humble/setup.bash 확인',
    'ROS2 Humble 설치 및 워크스페이스 구성 가이드.',
    ARRAY['ros2', 'humble', '설치'],
    '[]'::jsonb,
    true,
    15,
    '2025-01-12 11:20:00+09',
    '2025-01-12 11:20:00+09'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'ROS2 패키지 빌드 및 실행 가이드',
    'colcon을 사용한 ROS2 패키지 빌드, 의존성 관리, 실행 방법을 단계별로 설명합니다.',
    (SELECT id FROM public.categories WHERE name = 'ROS'),
    ARRAY['ros2', 'colcon', '패키지', '빌드', '의존성'],
    '의존성 오류 시: rosdep update && rosdep install --from-paths src',
    'ROS2 패키지 빌드 및 실행을 위한 colcon 사용법.',
    ARRAY['ros2', 'colcon', '빌드'],
    '[]'::jsonb,
    true,
    10,
    '2025-01-22 13:30:00+09',
    '2025-01-22 13:30:00+09'
  );

-- 최쿠버의 게시글들
INSERT INTO public.posts (
  user_id, title, description, category_id, tags,
  troubleshooting_raw, ai_summary, ai_keywords, troubleshooting_notes,
  is_public, like_count, created_at, updated_at
) VALUES
  (
    '44444444-4444-4444-4444-444444444444',
    'Kubernetes 로컬 개발 환경 구축 (minikube)',
    'minikube를 사용하여 로컬에서 Kubernetes 클러스터를 구성하고 첫 번째 애플리케이션을 배포하는 방법을 다룹니다.',
    (SELECT id FROM public.categories WHERE name = 'Kubernetes'),
    ARRAY['kubernetes', 'minikube', '로컬개발', '클러스터', '배포'],
    'minikube 시작 실패: VirtualBox 또는 Docker Desktop 확인',
    'minikube를 활용한 로컬 Kubernetes 개발 환경 구축 가이드.',
    ARRAY['kubernetes', 'minikube', '로컬개발'],
    '[]'::jsonb,
    true,
    22,
    '2025-01-08 08:15:00+09',
    '2025-01-08 08:15:00+09'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Kubernetes ConfigMap과 Secret 관리',
    '애플리케이션 설정과 민감 정보를 ConfigMap과 Secret으로 관리하는 방법과 베스트 프랙티스를 설명합니다.',
    (SELECT id FROM public.categories WHERE name = 'Kubernetes'),
    ARRAY['kubernetes', 'configmap', 'secret', '설정관리', '보안'],
    'Secret 값 확인: kubectl get secret <name> -o jsonpath="{.data.key}" | base64 -d',
    'Kubernetes ConfigMap과 Secret을 활용한 설정 관리 방법.',
    ARRAY['kubernetes', 'configmap', 'secret'],
    '[]'::jsonb,
    true,
    14,
    '2025-01-25 10:00:00+09',
    '2025-01-25 10:00:00+09'
  );

-- 정파이의 게시글들
INSERT INTO public.posts (
  user_id, title, description, category_id, tags,
  troubleshooting_raw, ai_summary, ai_keywords, troubleshooting_notes,
  is_public, like_count, created_at, updated_at
) VALUES
  (
    '55555555-5555-5555-5555-555555555555',
    'Python 가상환경 관리 (venv, poetry)',
    'venv와 poetry를 사용하여 Python 프로젝트의 가상환경과 의존성을 체계적으로 관리하는 방법을 설명합니다.',
    (SELECT id FROM public.categories WHERE name = 'Python'),
    ARRAY['python', 'venv', 'poetry', '가상환경', '의존성관리'],
    'poetry 설치 오류: pip install --upgrade pip 후 재시도',
    'Python 가상환경 관리 도구 venv와 poetry 사용법 가이드.',
    ARRAY['python', 'venv', 'poetry'],
    '[]'::jsonb,
    true,
    20,
    '2025-01-14 15:30:00+09',
    '2025-01-14 15:30:00+09'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Python 프로젝트 구조 및 패키징',
    '표준 Python 프로젝트 구조를 설정하고 setuptools를 사용하여 패키지를 배포 가능한 형태로 만드는 방법을 다룹니다.',
    (SELECT id FROM public.categories WHERE name = 'Python'),
    ARRAY['python', '프로젝트구조', '패키징', 'setuptools', '배포'],
    '패키지 설치 실패: python -m pip install -e . 사용',
    'Python 프로젝트 구조 설계 및 패키징 방법 가이드.',
    ARRAY['python', '패키징', '프로젝트구조'],
    '[]'::jsonb,
    true,
    11,
    '2025-01-28 12:00:00+09',
    '2025-01-28 12:00:00+09'
  );

-- ============================================================================
-- 3. POST_STEPS (게시글별 상세 단계)
-- ============================================================================
-- 참고: post_id는 위에서 삽입된 게시글의 ID를 참조합니다.
-- 실제 실행 시에는 ID가 자동 생성되므로, 아래 쿼리는 예시입니다.
-- 실제로는 각 INSERT 후 RETURNING id를 사용하거나, 
-- 게시글 제목으로 조회하여 post_id를 얻어야 합니다.

-- Git 협업 워크플로우 설정하기 (post_id는 실행 시 확인 필요)
-- 예시: SELECT id FROM posts WHERE title = 'Git 협업 워크플로우 설정하기';
INSERT INTO public.post_steps (post_id, sort_order, content, image_url)
SELECT 
  p.id,
  step.sort_order,
  step.content,
  step.image_url
FROM public.posts p
CROSS JOIN (VALUES
  (1, '새로운 기능 브랜치 생성: git checkout -b feature/new-feature', NULL),
  (2, '변경사항 커밋: git add . && git commit -m "feat: 새로운 기능 추가"', NULL),
  (3, '원격 저장소에 푸시: git push origin feature/new-feature', NULL),
  (4, 'GitHub/GitLab에서 Pull Request 생성 및 코드 리뷰 요청', NULL)
) AS step(sort_order, content, image_url)
WHERE p.title = 'Git 협업 워크플로우 설정하기'
ON CONFLICT (post_id, sort_order) DO NOTHING;

-- Git Hooks로 코드 품질 자동화
INSERT INTO public.post_steps (post_id, sort_order, content, image_url)
SELECT 
  p.id,
  step.sort_order,
  step.content,
  step.image_url
FROM public.posts p
CROSS JOIN (VALUES
  (1, '.git/hooks/pre-commit 파일 생성: touch .git/hooks/pre-commit', NULL),
  (2, 'pre-commit hook 스크립트 작성 (black, flake8, pytest 실행)', NULL),
  (3, '실행 권한 부여: chmod +x .git/hooks/pre-commit', NULL),
  (4, '테스트: git commit 시 자동으로 코드 검사 실행 확인', NULL)
) AS step(sort_order, content, image_url)
WHERE p.title = 'Git Hooks로 코드 품질 자동화'
ON CONFLICT (post_id, sort_order) DO NOTHING;

-- Docker Compose로 개발 환경 구성하기
INSERT INTO public.post_steps (post_id, sort_order, content, image_url)
SELECT 
  p.id,
  step.sort_order,
  step.content,
  step.image_url
FROM public.posts p
CROSS JOIN (VALUES
  (1, 'docker-compose.yml 파일 생성 및 서비스 정의 (db, redis, backend)', NULL),
  (2, '환경 변수 파일 .env 생성: DB_PASSWORD, REDIS_URL 등 설정', NULL),
  (3, '컨테이너 실행: docker-compose up -d', NULL),
  (4, '로그 확인: docker-compose logs -f backend', NULL)
) AS step(sort_order, content, image_url)
WHERE p.title = 'Docker Compose로 개발 환경 구성하기'
ON CONFLICT (post_id, sort_order) DO NOTHING;

-- Docker 멀티 스테이지 빌드 최적화
INSERT INTO public.post_steps (post_id, sort_order, content, image_url)
SELECT 
  p.id,
  step.sort_order,
  step.content,
  step.image_url
FROM public.posts p
CROSS JOIN (VALUES
  (1, 'Dockerfile에 빌드 스테이지 정의: FROM node:18 AS builder', NULL),
  (2, '의존성 설치 및 빌드 수행 (builder 스테이지)', NULL),
  (3, '프로덕션 스테이지 정의: FROM node:18-alpine AS production', NULL),
  (4, '빌드 결과물만 복사하여 최종 이미지 생성', NULL)
) AS step(sort_order, content, image_url)
WHERE p.title = 'Docker 멀티 스테이지 빌드 최적화'
ON CONFLICT (post_id, sort_order) DO NOTHING;

-- ROS2 Humble 개발 환경 설정
INSERT INTO public.post_steps (post_id, sort_order, content, image_url)
SELECT 
  p.id,
  step.sort_order,
  step.content,
  step.image_url
FROM public.posts p
CROSS JOIN (VALUES
  (1, 'Ubuntu 22.04에 ROS2 Humble 저장소 추가', NULL),
  (2, '패키지 설치: sudo apt update && sudo apt install ros-humble-desktop', NULL),
  (3, '환경 변수 설정: echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc', NULL),
  (4, '워크스페이스 생성: mkdir -p ~/ros2_ws/src && cd ~/ros2_ws', NULL)
) AS step(sort_order, content, image_url)
WHERE p.title = 'ROS2 Humble 개발 환경 설정'
ON CONFLICT (post_id, sort_order) DO NOTHING;

-- ROS2 패키지 빌드 및 실행 가이드
INSERT INTO public.post_steps (post_id, sort_order, content, image_url)
SELECT 
  p.id,
  step.sort_order,
  step.content,
  step.image_url
FROM public.posts p
CROSS JOIN (VALUES
  (1, '새 ROS2 패키지 생성: ros2 pkg create --build-type ament_python my_package', NULL),
  (2, '의존성 설치: rosdep install --from-paths src --ignore-src -r -y', NULL),
  (3, '패키지 빌드: colcon build --symlink-install', NULL),
  (4, '환경 설정 및 실행: source install/setup.bash && ros2 run my_package my_node', NULL)
) AS step(sort_order, content, image_url)
WHERE p.title = 'ROS2 패키지 빌드 및 실행 가이드'
ON CONFLICT (post_id, sort_order) DO NOTHING;

-- Kubernetes 로컬 개발 환경 구축 (minikube)
INSERT INTO public.post_steps (post_id, sort_order, content, image_url)
SELECT 
  p.id,
  step.sort_order,
  step.content,
  step.image_url
FROM public.posts p
CROSS JOIN (VALUES
  (1, 'minikube 설치: brew install minikube (macOS) 또는 공식 문서 참조', NULL),
  (2, 'minikube 시작: minikube start --driver=docker', NULL),
  (3, 'kubectl 설치 및 클러스터 연결 확인: kubectl get nodes', NULL),
  (4, '첫 번째 Deployment 생성: kubectl create deployment nginx --image=nginx', NULL)
) AS step(sort_order, content, image_url)
WHERE p.title = 'Kubernetes 로컬 개발 환경 구축 (minikube)'
ON CONFLICT (post_id, sort_order) DO NOTHING;

-- Kubernetes ConfigMap과 Secret 관리
INSERT INTO public.post_steps (post_id, sort_order, content, image_url)
SELECT 
  p.id,
  step.sort_order,
  step.content,
  step.image_url
FROM public.posts p
CROSS JOIN (VALUES
  (1, 'ConfigMap 생성: kubectl create configmap app-config --from-literal=key=value', NULL),
  (2, 'Secret 생성: kubectl create secret generic app-secret --from-literal=password=secret123', NULL),
  (3, 'Deployment에 ConfigMap과 Secret 마운트 설정', NULL),
  (4, 'Pod에서 환경 변수로 접근 확인: kubectl exec <pod> -- env', NULL)
) AS step(sort_order, content, image_url)
WHERE p.title = 'Kubernetes ConfigMap과 Secret 관리'
ON CONFLICT (post_id, sort_order) DO NOTHING;

-- Python 가상환경 관리 (venv, poetry)
INSERT INTO public.post_steps (post_id, sort_order, content, image_url)
SELECT 
  p.id,
  step.sort_order,
  step.content,
  step.image_url
FROM public.posts p
CROSS JOIN (VALUES
  (1, 'venv 가상환경 생성: python -m venv venv', NULL),
  (2, '가상환경 활성화: source venv/bin/activate (Linux/Mac) 또는 venv\\Scripts\\activate (Windows)', NULL),
  (3, 'poetry 설치: pip install poetry', NULL),
  (4, 'poetry 프로젝트 초기화: poetry init && poetry install', NULL)
) AS step(sort_order, content, image_url)
WHERE p.title = 'Python 가상환경 관리 (venv, poetry)'
ON CONFLICT (post_id, sort_order) DO NOTHING;

-- Python 프로젝트 구조 및 패키징
INSERT INTO public.post_steps (post_id, sort_order, content, image_url)
SELECT 
  p.id,
  step.sort_order,
  step.content,
  step.image_url
FROM public.posts p
CROSS JOIN (VALUES
  (1, '표준 프로젝트 구조 생성: mypackage/, tests/, setup.py, README.md', NULL),
  (2, 'setup.py 작성: 패키지 메타데이터 및 의존성 정의', NULL),
  (3, '개발 모드로 설치: pip install -e .', NULL),
  (4, '배포 패키지 빌드: python setup.py sdist bdist_wheel', NULL)
) AS step(sort_order, content, image_url)
WHERE p.title = 'Python 프로젝트 구조 및 패키징'
ON CONFLICT (post_id, sort_order) DO NOTHING;

-- ============================================================================
-- 4. BOOKMARKS (북마크 데이터)
-- ============================================================================

INSERT INTO public.bookmarks (user_id, post_id, created_at)
SELECT 
  u.id,
  p.id,
  p.created_at + interval '1 day'
FROM public.profiles u
CROSS JOIN public.posts p
WHERE 
  -- 김개발이 Docker, Kubernetes 게시글 북마크
  (u.id = '11111111-1111-1111-1111-111111111111' AND p.category_id IN (
    (SELECT id FROM public.categories WHERE name = 'Docker'),
    (SELECT id FROM public.categories WHERE name = 'Kubernetes')
  ))
  OR
  -- 박도커가 Python 게시글 북마크
  (u.id = '22222222-2222-2222-2222-222222222222' AND p.category_id = (SELECT id FROM public.categories WHERE name = 'Python'))
  OR
  -- 이로봇이 Git 게시글 북마크
  (u.id = '33333333-3333-3333-3333-333333333333' AND p.category_id = (SELECT id FROM public.categories WHERE name = 'Git'))
  OR
  -- 최쿠버가 ROS 게시글 북마크
  (u.id = '44444444-4444-4444-4444-444444444444' AND p.category_id = (SELECT id FROM public.categories WHERE name = 'ROS'))
  OR
  -- 정파이가 Docker 게시글 북마크
  (u.id = '55555555-5555-5555-5555-555555555555' AND p.category_id = (SELECT id FROM public.categories WHERE name = 'Docker'))
ON CONFLICT (user_id, post_id) DO NOTHING;

-- ============================================================================
-- 5. POST_LIKES (좋아요 데이터)
-- ============================================================================

INSERT INTO public.post_likes (user_id, post_id, created_at)
SELECT 
  u.id,
  p.id,
  p.created_at + interval '2 hours'
FROM public.profiles u
CROSS JOIN public.posts p
WHERE 
  -- 다양한 유저가 다양한 게시글에 좋아요
  (u.id = '11111111-1111-1111-1111-111111111111' AND p.title IN ('Docker Compose로 개발 환경 구성하기', 'Python 가상환경 관리 (venv, poetry)'))
  OR
  (u.id = '22222222-2222-2222-2222-222222222222' AND p.title IN ('Git 협업 워크플로우 설정하기', 'ROS2 Humble 개발 환경 설정', 'Python 가상환경 관리 (venv, poetry)'))
  OR
  (u.id = '33333333-3333-3333-3333-333333333333' AND p.title IN ('Docker Compose로 개발 환경 구성하기', 'Kubernetes 로컬 개발 환경 구축 (minikube)'))
  OR
  (u.id = '44444444-4444-4444-4444-444444444444' AND p.title IN ('Git 협업 워크플로우 설정하기', 'ROS2 Humble 개발 환경 설정', 'Python 가상환경 관리 (venv, poetry)'))
  OR
  (u.id = '55555555-5555-5555-5555-555555555555' AND p.title IN ('Docker Compose로 개발 환경 구성하기', 'Kubernetes 로컬 개발 환경 구축 (minikube)', 'ROS2 패키지 빌드 및 실행 가이드'))
ON CONFLICT (user_id, post_id) DO NOTHING;

-- ============================================================================
-- 6. POSTS의 like_count 업데이트 (실제 좋아요 수 반영)
-- ============================================================================

UPDATE public.posts p
SET like_count = (
  SELECT COUNT(*) 
  FROM public.post_likes pl 
  WHERE pl.post_id = p.id
)
WHERE EXISTS (
  SELECT 1 FROM public.post_likes pl WHERE pl.post_id = p.id
);

-- ============================================================================
-- 시드 완료
-- ============================================================================
-- 
-- 생성된 데이터 요약:
-- - Profiles: 5명
-- - Posts: 10개 (카테고리별 2개씩)
-- - Post Steps: 각 게시글당 4단계
-- - Bookmarks: 5개 이상
-- - Post Likes: 10개 이상
--
-- UI 테스트 시나리오:
-- 1. 카테고리별 게시글 목록 확인
-- 2. 태그 필터링 테스트
-- 3. 북마크 기능 테스트
-- 4. 좋아요 기능 및 카운트 확인
-- 5. 게시글 상세 및 단계 표시 확인
-- 6. 마이페이지 (내 게시글, 북마크) 확인
--
-- ============================================================================
