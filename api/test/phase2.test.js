'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { RESOURCES, normalize } = require('../phase2');

test('Phase 2는 요청된 구조화 테이블 자원을 모두 정의한다', () => {
  assert.deepEqual(Object.keys(RESOURCES), ['careers','awards','activities','press','fields','works','performances','programs','performers','media']);
});
test('작품 입력은 공개·대표·정렬 값을 안전한 형식으로 변환한다', () => {
  const value=normalize('works',{title:'  어머니의 봄 ',body:'본문',is_visible:'false',is_featured:'true',sort_order:'20',unknown:'x'});
  assert.deepEqual(value,{title:'어머니의 봄',body:'본문',is_visible:false,is_featured:true,sort_order:20});
});
test('소개 이관 데이터의 사실 확인 상태는 확인 필요가 기본이다', () => {
  assert.equal(normalize('careers',{title:'임시 약력'}).title,'임시 약력');
  assert.equal(normalize('careers',{title:'임시 약력',verification_status:'invalid'}).verification_status,'needs_review');
});
test('제목 없는 작품과 지나치게 긴 입력을 거부한다', () => {
  assert.throws(()=>normalize('works',{excerpt:'설명'}),/제목/);
  assert.throws(()=>normalize('works',{title:'시',body:'x'.repeat(30001)}),/너무 깁니다/);
});
