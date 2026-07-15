-- ============================================================
-- 003_storage_policies.sql
-- store-images 버킷 RLS 정책
-- (버킷 자체는 Supabase 대시보드에서 public 버킷으로 미리 생성되어 있어야 함)
-- 업로드 경로 규칙: {user_id}/{timestamp}_{filename}
-- ============================================================

-- 공개 읽기: 누구나 store-images 버킷의 파일을 조회 가능
create policy "store_images_public_read"
  on storage.objects for select
  using (bucket_id = 'store-images');

-- 업로드: 로그인한 사용자는 자기 uid 폴더 안에만 업로드 가능
create policy "store_images_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'store-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 수정: 자기 폴더의 파일만 수정 가능
create policy "store_images_update_own_folder"
  on storage.objects for update
  using (
    bucket_id = 'store-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 삭제: 자기 폴더의 파일만 삭제 가능
create policy "store_images_delete_own_folder"
  on storage.objects for delete
  using (
    bucket_id = 'store-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
