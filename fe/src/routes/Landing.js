import "./Landing.css";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div id="Landing">
      <Header />
      <section className="sect1">
        {bubbleTexts.map((item, i) => (<Bubble key={i} {...item} />))}
      </section>
      <section className="sect2">
        <img src="/img/sect3.png" />
      </section>
      <section className="sect3">
        <p>오늘도</p>
        <p>내 앞을 지나는</p>
        <p>수많은</p>
        <p className="p1">택시 <img src="/img/taxi.png" /></p>
        <p className="p3">만원 버스 <img src="/img/bus.png" /></p>
        <p className="p2">지하철 <img src="/img/subway.png" /></p>
      </section>
      <section className="sect4">
        <p>
          <img src="/img/depressed.png" />
          우린 언제쯤 목적지에 도착할 수 있을까요 ?
        </p>
      </section>
      <section className="sect5">
        <img src="/img/people.png" className="img_people" />
        <img src="/img/car.png" className="img_car" />
        <p>도로변에서 택시를 잡고 있는 우리<span> ,</span></p>
        <p>서로 갈 길이 멀어 보이는데 같이 타고 갈 수는 없는 걸까요 ?</p>
      </section>
      <section className="sect6">
        <div>
          <p>
            <span>이럴 땐 하늘에서 차가 뚝 떨어졌으면 좋겠다니까요<img src="/img/crying.png" /></span>
            <span>이럴 땐 하늘에서 차가 뚝 떨어졌으면 좋겠다니까요<img src="/img/crying.png" /></span>
          </p>
        </div>
      </section>
      <section className="sect7">
        <div className="row">
          <div>
            <p><span>그런</span></p>
            <p></p>
            <p></p>
          </div>
          <div>
            <p></p>
            <p><span>여러분들을</span></p>
            <p></p>
          </div>
          <div>
            <p></p>
            <p></p>
            <p><span>위해</span></p>
          </div>
          <div>
            <p><span>당근이</span></p>
            <p></p>
            <p></p>
          </div>
          <div>
            <p></p>
            <p><span>마차를</span></p>
            <p></p>
          </div>
          <div>
            <p></p>
            <p></p>
            <p><span>준비했습니다~!</span></p>
          </div>
          <div>
            <p></p>
            <p><img src="/img/car.png" /></p>
            <p></p>
          </div>
        </div>
      </section>
      <section className="sect8">
        <p>손 쉽게 작성하고</p>
        <div className="all">전체</div>
        <div className="taxi">
          <img src="/img/taxi.png" />
          택시
        </div>
        <div className="driver">
          <img src="/img/wheel.png" />
          드라이버
        </div>
        <div className="carfuller">
          <img src="/img/siren.png" />
          카풀러
        </div>
        <div className="create"></div>
      </section>
      <section className="sect9">
        <p>가격은 우리끼리 정해봐요</p>
      </section>
      <section className="sect10">
        <div>
          <span>당신</span>
          <span>근처의</span>
          <span>마차</span>
        </div>
        <Link to="/main">체험해보기</Link>
        <Footer />
      </section>
    </div>
  );
}

export function Bubble({ text, img, imgCount = 1, className }) {
  return (
    <div className={`Bubble ${className}`}>
      <p>{text}</p>
      {img && Array(imgCount).fill(null).map((_, index) => (
        <img key={index} src={img} alt="버블 이미지" />
      ))}
    </div>
  )
}

const bubbleTexts = [
  { text: '완전 지옥철이야', img: '/img/skull.png', imgCount: 1 },
  { text: '가는 중..!' },
  { text: `I'm on my way..!` },
  { text: '저도 좀 태워주세요', img: '/img/crying.png', imgCount: 3 },
  { text: '打不到出租车', img: '/img/crying2.png', imgCount: 1 },
  { text: 'Hurry Up !' },
  { text: '你在来吗？' },
  { text: '行っている' },
  { text: 'おくれそうです (；′⌒`)' },
  { text: '택시가 안 잡혀', img: '/img/headache.png', imgCount: 1 },
  { text: '오늘도 놓쳤어' },
  { text: `I'll` },
  { text: '아가, 언제 들어오니?' },
  { text: 'gonna take long time' },
  { text: '님 어디임?' },
  { text: 'Late today?' },
  { text: '나도 집 가고 싶다...' },
  { text: '몇 시까지 도착하실 수 있으세요?' },
  { text: '遅れそうです :(' },
  { text: '너 오늘 진짜 늦으면 안 된다' },
  { text: 'WHERE ARE YOU NOW.' },
  { text: '今どこですか' },
  { text: 'ㆍㆍㆍ' },
];