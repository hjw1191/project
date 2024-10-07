import './Guide.css';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";


export function Guide() {
  return (
    <div className="membership">
      <Header />
      <h1>카풀 플러스 멤버십 프로그램</h1>
      <section className="membership-tiers">
        <h2>멤버십 등급 체계</h2>
        <table>
          <thead>
            <tr>
              <th>등급</th>
              <th>조건</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>브론즈</td>
              <td>기본 등급</td>
            </tr>
            <tr>
              <td>실버</td>
              <td>월 5회 이상 이용 또는 월 5만원 이상 결제</td>
            </tr>
            <tr>
              <td>골드</td>
              <td>월 10회 이상 이용 또는 월 10만원 이상 결제</td>
            </tr>
            <tr>
              <td>플래티넘</td>
              <td>월 20회 이상 이용 또는 월 20만원 이상 결제</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="taxi-benefits">
        <h2>택시 연계 혜택</h2>
        <ul>
          <li>골드 등급: 택시 요금 30% 할인 또는 포인트 1.5배 적립</li>
          <li>플래티넘 등급: 택시 요금 50% 할인 또는 포인트 2배 적립</li>
        </ul>
      </section>

      <section className="monthly-plans">
        <h2>월정액 옵션</h2>
        <table>
          <thead>
            <tr>
              <th>패스</th>
              <th>가격</th>
              <th>혜택</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>실버 패스</td>
              <td>월 7만원</td>
              <td>실버 등급 혜택 + 월 7회 무료 카풀</td>
            </tr>
            <tr>
              <td>골드 패스</td>
              <td>월 15만원</td>
              <td>골드 등급 혜택 + 월 15회 무료 카풀</td>
            </tr>
            <tr>
              <td>플래티넘 패스</td>
              <td>월 25만원</td>
              <td>플래티넘 등급 혜택 + 무제한 카풀</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="point-system">
        <h2>포인트 시스템</h2>
        <ul>
          <li>기본 적립률: 결제 금액의 5%</li>
          <li>등급별 적립률:
            <ul>
              <li>골드: 7%</li>
              <li>플래티넘: 10%</li>
            </ul>
          </li>
          <li>포인트 사용: 택시 요금 결제 가능 (1포인트 = 1원)</li>
        </ul>
      </section>

      <section className="taxi-cooperation">
        <h2>택시 업계 상생 방안</h2>
        <ul>
          <li>할인된 택시 요금의 일부를 회사에서 보전</li>
          <li>택시 기사들에게 카풀 플러스 멤버 우선 배차 옵션 제공</li>
        </ul>
      </section>

      <section className="additional-benefits">
        <h2>추가 혜택</h2>
        <ul>
          <li>골드 이상 등급: 프리미엄 차량 이용 가능</li>
          <li>플래티넘 등급: 공항 픽업 서비스 월 1회 무료</li>
        </ul>
      </section>

      <section className="season-pass">
        <h2>시즌 패스</h2>
        <p>특정 기간 한정 특별 패스 (예: "여름 휴가 패스")</p>
        <p>혜택: 7월 한 달 동안 무제한 카풀 + 택시 40% 할인</p>
      </section>

      <section className="family-plan">
        <h2>가족 공유 플랜</h2>
        <p>가족 구성원들이 하나의 멤버십을 공유하여 혜택 분배</p>
      </section>

      <section className="corporate-membership">
        <h2>기업 멤버십</h2>
        <ul>
          <li>회사 단위 가입 가능한 특별 프로그램</li>
          <li>출퇴근 시간대 우선 배차, 비용 정산 간소화 등 혜택 제공</li>
        </ul>
      </section>

      <section className="loyalty-bonus">
        <h2>멤버십 등급 유지 보너스</h2>
        <p>3개월 연속 같은 등급 유지 시 추가 혜택 제공 (예: 무료 카풀 1회)</p>
      </section>

      <section className="referral-program">
        <h2>친구 추천 프로그램</h2>
        <p>신규 가입 시 추천인과 피추천인 모두에게 추가 포인트 지급</p>
      </section>
      <Footer />
    </div>
  );
}