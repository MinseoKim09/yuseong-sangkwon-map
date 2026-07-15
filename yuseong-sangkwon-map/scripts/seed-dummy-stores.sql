-- 테스트용 더미 stores 3개 (유성구청 인근, 마커 표시 확인용)
insert into stores (name, category, address, road_address, lat, lng, phone, is_vacant, description, source)
values
  ('테스트 식당', 'restaurant', '대전 유성구 대학로 76', '대전 유성구 대학로 76', 36.3624, 127.3564, '042-000-0001', false, '더미 데이터 - 식당', 'user'),
  ('테스트 카페', 'cafe', '대전 유성구 대학로 인근', '대전 유성구 대학로 90', 36.3634, 127.3574, '042-000-0002', false, '더미 데이터 - 카페', 'user'),
  ('테스트 소매점', 'retail', '대전 유성구 대학로 인근', '대전 유성구 대학로 60', 36.3614, 127.3554, '042-000-0003', true, '더미 데이터 - 소매점 (공실)', 'user');
