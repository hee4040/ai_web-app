# EnvRecipe 구현 로드맵

> **Supabase SDK + Google Auth 기반 단계별 구현 계획**

본 문서는 EnvRecipe 프로젝트의 실제 구현을 위한 Step-by-step 로직 구현 계획입니다.  
Supabase SDK를 활용한 Google OAuth 인증부터 시작하여 Phase 1 MVP 기능까지 단계별로 구현합니다.

---

## 📋 목차

1. [프로젝트 현황](#프로젝트-현황)
2. [환경 설정](#환경-설정)
3. [Phase 1 구현 단계](#phase-1-구현-단계)
4. [세부 구현 가이드](#세부-구현-가이드)
5. [테스트 체크리스트](#테스트-체크리스트)

---

## 프로젝트 현황

### ✅ 완료된 작업

- [x] 데이터베이스 스키마 설계 및 마이그레이션
  - `profiles`, `categories`, `posts`, `post_steps`, `bookmarks`, `post_likes` 테이블
  - RLS 정책 설정
  - 트리거 (profiles 자동 생성)
  - 시드 데이터 준비
- [x] TypeScript 타입 정의 (`types/database.ts`, `types/recipe.ts`)
- [x] UI 컴포넌트 구조 (shadcn/ui 기반)
- [x] 페이지 라우팅 구조 (App Router)

### ⚠️ 미완성 작업

- [ ] Supabase 클라이언트 구현 (`lib/supabase/client.ts`, `server.ts`)
- [ ] Google OAuth 인증 구현
- [ ] 인증 상태 관리 훅 (`hooks/use-auth.ts`)
- [ ] 레시피 CRUD API 연동
- [ ] AI 보조 기능 연동
- [ ] 이미지 업로드 (Supabase Storage)

---

## 환경 설정

### 1. Supabase 프로젝트 설정

#### 1.1 Supabase 프로젝트 생성 및 설정

1. [Supabase Dashboard](https://app.supabase.com)에서 프로젝트 생성
2. 프로젝트 설정에서 다음 정보 확인:
   - Project URL
   - Anon (public) key
   - Service role key (서버 사이드 전용)

#### 1.2 Google OAuth 설정

1. **Google Cloud Console 설정**
   ```
   1. Google Cloud Console 접속
   2. 프로젝트 생성 또는 선택
   3. APIs & Services > Credentials
   4. OAuth 2.0 Client ID 생성
      - Application type: Web application
      - Authorized redirect URIs:
        - https://<your-project-ref>.supabase.co/auth/v1/callback
        - http://localhost:3000/auth/callback (로컬 개발용)
   ```

2. **Supabase Dashboard에서 Google Provider 설정**
   ```
   Authentication > Providers > Google
   - Enable Google provider: ON
   - Client ID: Google Cloud Console에서 발급받은 Client ID
   - Client Secret: Google Cloud Console에서 발급받은 Client Secret
   ```

#### 1.3 환경 변수 설정

`.env.local` 파일 생성:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# AI API (Phase 1: 선택사항)
AI_API_KEY=<your-ai-api-key>
AI_API_URL=<your-ai-api-url>
```

---

## Phase 1 구현 단계

### Step 1: Supabase 클라이언트 설정

**목표**: 클라이언트/서버 사이드 Supabase 클라이언트 구현

#### 1.1 패키지 설치

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

#### 1.2 클라이언트 사이드 클라이언트 (`lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### 1.3 서버 사이드 클라이언트 (`lib/supabase/server.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서 호출 시 무시
          }
        },
      },
    }
  )
}
```

#### 1.4 미들웨어 설정 (`middleware.ts` 루트에 생성)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**체크리스트**:
- [ ] `@supabase/supabase-js`, `@supabase/ssr` 패키지 설치
- [ ] `lib/supabase/client.ts` 구현
- [ ] `lib/supabase/server.ts` 구현
- [ ] `middleware.ts` 생성 및 설정
- [ ] 환경 변수 설정 확인

---

### Step 2: Google OAuth 인증 구현

**목표**: Google 로그인 버튼 클릭 → 인증 완료 → 세션 생성

#### 2.1 인증 상태 관리 훅 (`hooks/use-auth.ts`)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // 초기 사용자 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
  }
}
```

#### 2.2 로그인 페이지 업데이트 (`app/(auth)/login/page.tsx`)

```typescript
'use client'

import Link from "next/link"
import { Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { signInWithGoogle, user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
      // TODO: 에러 토스트 표시
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      {/* ... 기존 UI 코드 ... */}
      <Button
        onClick={handleGoogleSignIn}
        variant="outline"
        className="h-11 w-full gap-3 bg-card text-sm font-medium"
      >
        {/* Google 아이콘 SVG */}
        Continue with Google
      </Button>
      {/* ... 나머지 UI ... */}
    </div>
  )
}
```

#### 2.3 OAuth 콜백 처리 (`app/(auth)/callback/page.tsx`)

```typescript
'use client'

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        console.error('OAuth error:', error)
        router.push(`/login?error=${encodeURIComponent(error)}`)
        return
      }

      if (code) {
        // 코드를 세션으로 교환
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          console.error('Session exchange error:', exchangeError)
          router.push(`/login?error=${encodeURIComponent(exchangeError.message)}`)
          return
        }

        // 성공 시 홈으로 리다이렉트
        router.push('/')
      } else {
        router.push('/login')
      }
    }

    handleCallback()
  }, [router, searchParams, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Processing authentication...</p>
      </div>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
```

#### 2.4 헤더 컴포넌트 업데이트 (`components/common/Header.tsx`)

```typescript
'use client'

import { useAuth } from "@/hooks/use-auth"
import { UserMenu } from "@/components/domain/auth/user-menu"
import { LoginButton } from "@/components/domain/auth/login-button"

export function Header() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <header>
      {/* ... 기존 헤더 UI ... */}
      {user ? <UserMenu user={user} /> : <LoginButton />}
    </header>
  )
}
```

**체크리스트**:
- [ ] `hooks/use-auth.ts` 구현
- [ ] 로그인 페이지에 Google 로그인 버튼 연동
- [ ] OAuth 콜백 페이지 구현
- [ ] 헤더에 인증 상태 반영
- [ ] 로그인/로그아웃 플로우 테스트

---

### Step 3: 레시피 목록 조회 (Read)

**목표**: 카테고리별 레시피 리스트 표시

#### 3.1 레시피 조회 훅 (`hooks/use-recipes.ts`)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Post, Category } from '@/types/database'

export interface RecipeWithCategory extends Post {
  categories: Category
}

export function useRecipes(categoryId?: number, sortBy: 'latest' | 'oldest' | 'name' = 'latest') {
  const [recipes, setRecipes] = useState<RecipeWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true)
        let query = supabase
          .from('posts')
          .select(`
            *,
            categories (*)
          `)
          .eq('is_public', true)

        // 카테고리 필터
        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }

        // 정렬
        switch (sortBy) {
          case 'latest':
            query = query.order('created_at', { ascending: false })
            break
          case 'oldest':
            query = query.order('created_at', { ascending: true })
            break
          case 'name':
            query = query.order('title', { ascending: true })
            break
        }

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError

        setRecipes(data as RecipeWithCategory[])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [categoryId, sortBy, supabase])

  return { recipes, loading, error }
}
```

#### 3.2 메인 페이지 업데이트 (`app/page.tsx`)

```typescript
import { RecipeList } from "@/components/domain/recipe/recipe-list"
import { CategoryTabs } from "@/components/domain/recipe/category-tabs"
import { SortDropdown } from "@/components/domain/recipe/sort-dropdown"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string }
}) {
  const supabase = await createClient()
  
  // 카테고리 목록 조회
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  const selectedCategory = searchParams.category
  const sortBy = (searchParams.sort as 'latest' | 'oldest' | 'name') || 'latest'

  // 선택된 카테고리 ID 찾기
  const categoryId = selectedCategory
    ? categories?.find(c => c.name === selectedCategory)?.id
    : undefined

  // 레시피 조회 (서버 컴포넌트에서 직접)
  let query = supabase
    .from('posts')
    .select(`
      *,
      categories (*)
    `)
    .eq('is_public', true)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  switch (sortBy) {
    case 'latest':
      query = query.order('created_at', { ascending: false })
      break
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'name':
      query = query.order('title', { ascending: true })
      break
  }

  const { data: recipes } = await query

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryTabs categories={categories || []} />
      <div className="mt-4 flex justify-end">
        <SortDropdown />
      </div>
      <RecipeList recipes={recipes || []} />
    </div>
  )
}
```

**체크리스트**:
- [ ] `hooks/use-recipes.ts` 구현 (클라이언트 사이드)
- [ ] 메인 페이지에서 서버 사이드 데이터 페칭
- [ ] 카테고리 필터링 동작 확인
- [ ] 정렬 기능 동작 확인
- [ ] 레시피 카드 표시 확인

---

### Step 4: 레시피 상세 조회

**목표**: 레시피 상세 페이지에서 전체 정보 표시

#### 4.1 상세 페이지 구현 (`app/recipes/[id]/page.tsx`)

```typescript
import { createClient } from "@/lib/supabase/server"
import { RecipeDetail } from "@/components/domain/recipe/recipe-detail"
import { notFound } from "next/navigation"

export default async function RecipeDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // 레시피 메인 정보 조회
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(`
      *,
      categories (*),
      profiles!posts_user_id_fkey (display_name, avatar_url)
    `)
    .eq('id', params.id)
    .eq('is_public', true)
    .single()

  if (postError || !post) {
    notFound()
  }

  // 레시피 단계 조회
  const { data: steps } = await supabase
    .from('post_steps')
    .select('*')
    .eq('post_id', params.id)
    .order('sort_order', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <RecipeDetail
        recipe={post}
        steps={steps || []}
      />
    </div>
  )
}
```

**체크리스트**:
- [ ] 상세 페이지에서 레시피 메인 정보 조회
- [ ] 레시피 단계(post_steps) 조회
- [ ] 작성자 정보(profiles) 조인 조회
- [ ] UI 컴포넌트에 데이터 전달 확인

---

### Step 5: 레시피 작성 (Create)

**목표**: 레시피 작성 폼 → DB 저장 → 이미지 업로드

#### 5.1 Supabase Storage 버킷 설정

1. Supabase Dashboard > Storage
2. 새 버킷 생성: `recipe-step-images`
3. Public 버킷으로 설정 (또는 RLS 정책 설정)

#### 5.2 레시피 작성 Server Action (`app/recipes/create/actions.ts`)

```typescript
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createRecipe(formData: FormData) {
  const supabase = await createClient()

  // 인증 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // 폼 데이터 파싱
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const categoryId = Number(formData.get('categoryId'))
  const tags = (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean)
  const troubleshootingRaw = formData.get('troubleshooting') as string | null

  // posts 테이블에 레시피 저장
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      title,
      description,
      category_id: categoryId,
      tags,
      troubleshooting_raw: troubleshootingRaw,
      is_public: true,
    })
    .select()
    .single()

  if (postError || !post) {
    throw new Error('Failed to create recipe')
  }

  // Steps 처리
  const stepsData = JSON.parse(formData.get('steps') as string) as Array<{
    content: string
    imageFile?: File
  }>

  // 이미지 업로드 및 post_steps 저장
  const stepPromises = stepsData.map(async (step, index) => {
    let imageUrl: string | null = null

    // 이미지가 있으면 업로드
    if (step.imageFile) {
      const fileExt = step.imageFile.name.split('.').pop()
      const fileName = `${user.id}/${post.id}/${Date.now()}-${index}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('recipe-step-images')
        .upload(fileName, step.imageFile)

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('recipe-step-images')
          .getPublicUrl(fileName)
        imageUrl = publicUrl
      }
    }

    // post_steps에 저장
    return supabase
      .from('post_steps')
      .insert({
        post_id: post.id,
        sort_order: index,
        content: step.content,
        image_url: imageUrl,
      })
  })

  await Promise.all(stepPromises)

  // AI 보조 기능 호출 (비동기, 백그라운드)
  // TODO: AI API 호출 및 posts 업데이트

  revalidatePath('/')
  revalidatePath(`/recipes/${post.id}`)

  return { success: true, postId: post.id }
}
```

#### 5.3 작성 페이지 업데이트 (`app/recipes/create/page.tsx`)

```typescript
'use client'

import { RecipeForm } from "@/components/domain/recipe/recipe-form"
import { createRecipe } from "./actions"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"

export default function CreateRecipePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await createRecipe(formData)
      if (result.success) {
        router.push(`/recipes/${result.postId}`)
      }
    } catch (error) {
      console.error('Failed to create recipe:', error)
      // TODO: 에러 토스트 표시
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RecipeForm onSubmit={handleSubmit} />
    </div>
  )
}
```

**체크리스트**:
- [ ] Supabase Storage 버킷 생성
- [ ] Server Action 구현
- [ ] 이미지 업로드 로직 구현
- [ ] 작성 페이지 폼 연동
- [ ] 작성 후 상세 페이지로 리다이렉트 확인

---

### Step 6: AI 보조 기능 연동

**목표**: 레시피 저장 시 AI API 호출 → 결과 DB 저장

#### 6.1 AI API Route (구현됨: `app/api/ai/recipe-analyze/route.ts`)

```typescript
import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { troubleshooting, steps, title, category, postId } = body

    // AI API 호출 (예시)
    const aiResponse = await fetch(process.env.AI_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        troubleshooting,
        steps,
        title,
        category,
      }),
    })

    if (!aiResponse.ok) {
      throw new Error('AI API request failed')
    }

    const aiData = await aiResponse.json()

    // DB에 AI 결과 저장
    if (postId) {
      const supabase = await createClient()
      await supabase
        .from('posts')
        .update({
          ai_summary: aiData.summary,
          ai_keywords: aiData.keywords || [],
          troubleshooting_notes: aiData.notes || [],
        })
        .eq('id', postId)
    }

    return NextResponse.json({
      summary: aiData.summary,
      keywords: aiData.keywords || [],
      notes: aiData.notes || [],
    })
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}
```

#### 6.2 레시피 작성 시 AI 호출 (Server Action 수정)

```typescript
// createRecipe 함수 내부, post 생성 후

// AI 보조 기능 호출 (비동기)
if (troubleshootingRaw) {
  fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/recipe-analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      postId: post.id,
      troubleshooting: troubleshootingRaw,
      steps: stepsData.map(s => ({ content: s.content ?? s })),
      title,
      category: String(categoryId),
    }),
  }).catch(console.error) // 에러는 로그만, 사용자 블로킹 없음
}
```

**체크리스트**:
- [ ] AI API Route 구현
- [ ] 레시피 작성 시 AI 호출 연동
- [ ] AI 결과 DB 저장 확인
- [ ] 상세 페이지에서 AI 결과 표시 확인

---

### Step 7: 레시피 수정/삭제 (Update/Delete)

**목표**: 마이페이지에서 레시피 수정 및 삭제

#### 7.1 수정 페이지 구현 (`app/recipes/[id]/edit/page.tsx`)

```typescript
import { createClient } from "@/lib/supabase/server"
import { RecipeForm } from "@/components/domain/recipe/recipe-form"
import { notFound, redirect } from "next/navigation"

export default async function EditRecipePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 레시피 조회
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!post) {
    notFound()
  }

  // Steps 조회
  const { data: steps } = await supabase
    .from('post_steps')
    .select('*')
    .eq('post_id', params.id)
    .order('sort_order', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <RecipeForm
        initialData={{
          ...post,
          steps: steps || [],
        }}
        onSubmit={updateRecipe}
      />
    </div>
  )
}
```

#### 7.2 수정/삭제 Server Actions

```typescript
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateRecipe(postId: number, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // 기존 post 확인 (작성자 본인만)
  const { data: existingPost } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single()

  if (!existingPost || existingPost.user_id !== user.id) {
    throw new Error('Unauthorized')
  }

  // posts 업데이트
  const { error } = await supabase
    .from('posts')
    .update({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category_id: Number(formData.get('categoryId')),
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
      troubleshooting_raw: formData.get('troubleshooting') as string,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)

  if (error) throw error

  // 기존 steps 삭제 후 재생성
  await supabase.from('post_steps').delete().eq('post_id', postId)

  // 새 steps 저장 (이미지 업로드 포함)
  // ... createRecipe와 유사한 로직

  revalidatePath(`/recipes/${postId}`)
  revalidatePath('/mypage')
}

export async function deleteRecipe(postId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // 작성자 확인
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single()

  if (!post || post.user_id !== user.id) {
    throw new Error('Unauthorized')
  }

  // 삭제 (CASCADE로 post_steps도 함께 삭제됨)
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) throw error

  revalidatePath('/')
  revalidatePath('/mypage')
}
```

**체크리스트**:
- [ ] 수정 페이지 구현
- [ ] 수정 Server Action 구현
- [ ] 삭제 Server Action 구현
- [ ] 마이페이지에서 수정/삭제 버튼 연동
- [ ] RLS 정책으로 권한 확인

---

### Step 8: 마이페이지 구현

**목표**: 내가 작성한 레시피 목록 및 북마크 목록 표시

#### 8.1 마이페이지 구현 (`app/mypage/page.tsx`)

```typescript
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RecipeList } from "@/components/domain/recipe/recipe-list"

export default async function MyPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 내가 작성한 레시피
  const { data: myRecipes } = await supabase
    .from('posts')
    .select(`
      *,
      categories (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // 북마크한 레시피 (Phase 2)
  const { data: bookmarkedRecipes } = await supabase
    .from('bookmarks')
    .select(`
      posts (
        *,
        categories (*),
        profiles!posts_user_id_fkey (display_name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Recipes</h1>
      <RecipeList recipes={myRecipes || []} showActions />

      <h2 className="text-2xl font-bold mt-12 mb-6">Bookmarked</h2>
      <RecipeList 
        recipes={bookmarkedRecipes?.map(b => b.posts).filter(Boolean) || []} 
      />
    </div>
  )
}
```

**체크리스트**:
- [ ] 마이페이지에서 내 레시피 조회
- [ ] 북마크 목록 조회 (Phase 2)
- [ ] 공개/비공개 토글 기능
- [ ] 수정/삭제 버튼 동작 확인

---

## 세부 구현 가이드

### 인증 플로우 다이어그램

```
1. 사용자 → 로그인 페이지 접속
2. "Continue with Google" 클릭
3. useAuth.signInWithGoogle() 호출
4. Supabase Auth → Google OAuth 리다이렉트
5. Google 로그인 완료
6. Google → Supabase 콜백 (/auth/callback)
7. Supabase → 앱 콜백 (/auth/callback?code=...)
8. exchangeCodeForSession() 호출
9. 세션 쿠키 저장
10. 홈으로 리다이렉트
```

### 데이터 페칭 전략

- **서버 컴포넌트**: 초기 페이지 로드 시 데이터 페칭
- **클라이언트 컴포넌트**: 인터랙티브 기능 (필터, 정렬 등)
- **Server Actions**: 데이터 변경 (Create, Update, Delete)

### 에러 처리

- **인증 에러**: 로그인 페이지로 리다이렉트
- **권한 에러**: 403 페이지 또는 에러 메시지
- **네트워크 에러**: 재시도 로직 또는 사용자 알림

### 성능 최적화

- **이미지 최적화**: Next.js Image 컴포넌트 사용
- **쿼리 최적화**: 필요한 컬럼만 SELECT
- **캐싱**: 서버 컴포넌트 자동 캐싱 활용

---

## 테스트 체크리스트

### 인증 테스트

- [ ] Google 로그인 성공
- [ ] 로그아웃 동작
- [ ] 인증 상태 유지 (새로고침 후에도)
- [ ] 비인증 사용자 접근 제한

### 레시피 CRUD 테스트

- [ ] 레시피 목록 조회
- [ ] 카테고리 필터링
- [ ] 정렬 기능 (최신순, 오래된순, 이름순)
- [ ] 레시피 상세 조회
- [ ] 레시피 작성 (텍스트 + 이미지)
- [ ] 레시피 수정
- [ ] 레시피 삭제

### AI 보조 기능 테스트

- [ ] 레시피 작성 시 AI 호출
- [ ] AI 결과 DB 저장
- [ ] 상세 페이지에서 AI 결과 표시

### 마이페이지 테스트

- [ ] 내가 작성한 레시피 목록
- [ ] 북마크 목록 (Phase 2)
- [ ] 공개/비공개 토글

### 보안 테스트

- [ ] RLS 정책 동작 확인
- [ ] 본인만 수정/삭제 가능
- [ ] 비공개 레시피는 작성자만 조회 가능

---

## 다음 단계 (Phase 2)

1. **북마크 기능**: 북마크 추가/삭제 API
2. **좋아요 기능**: 공감 버튼 및 공감순 정렬
3. **검색 기능**: 제목 기반 ILIKE 검색
4. **태그 필터링**: 다중 태그 필터
5. **이미지 다중 업로드**: Step당 여러 이미지
6. **Drag & Drop**: Step 순서 변경

---

## 참고 자료

- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Supabase Storage 문서](https://supabase.com/docs/guides/storage)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Supabase SSR 가이드](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

---

**마지막 업데이트**: 2025-01-29
