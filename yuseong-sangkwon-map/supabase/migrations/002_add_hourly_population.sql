-- ============================================================
-- 002_add_hourly_population.sql
-- districts 테이블에 시간대별(0~23시) 유동인구 컬럼 추가 + 더미 데이터
-- ============================================================

alter table public.districts
  add column if not exists hourly_population jsonb not null default '[]'::jsonb;

comment on column public.districts.hourly_population is
  '0~23시 시간대별 유동인구 추정치를 담은 24개 정수 배열 (index = 시각)';

-- 시간대별 배율 곡선 (심야 저조 -> 출근/점심/퇴근 피크)
with hourly_curve(hour, multiplier) as (
  values
    (0, 0.15), (1, 0.10), (2, 0.08), (3, 0.07), (4, 0.08), (5, 0.12),
    (6, 0.25), (7, 0.45), (8, 0.70), (9, 0.65), (10, 0.60), (11, 0.70),
    (12, 0.95), (13, 1.00), (14, 0.75), (15, 0.65), (16, 0.68), (17, 0.80),
    (18, 0.98), (19, 0.90), (20, 0.75), (21, 0.55), (22, 0.35), (23, 0.22)
),
-- 동별 기준 인구(피크 시간대 기준 대략치)
district_base(name, base) as (
  values
    ('관평동', 3200),
    ('구즉동', 2100),
    ('노은1동', 4800),
    ('노은2동', 4200),
    ('노은3동', 3900),
    ('봉명1동', 5600),
    ('봉명2·구암동', 3400),
    ('신성동', 6800),
    ('온천1동', 5200),
    ('온천2동', 4700),
    ('원신흥동', 3100),
    ('전민동', 4400),
    ('진잠동', 1900),
    ('하기동', 2600)
)
update public.districts d
set hourly_population = agg.hourly
from (
  select
    db.name,
    jsonb_agg(round(db.base * hc.multiplier) order by hc.hour) as hourly
  from district_base db
  cross join hourly_curve hc
  group by db.name
) agg
where d.name = agg.name;
