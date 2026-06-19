export type Heritage = {
  id: string
  name: string
  category: string
  number: string
  region: string
  designatedAt: string
  holders: string[]
  shortDesc: string
  description: string
  videoSrc: string
  thumbnail: string
  likes: number
}

export const heritageList: Heritage[] = [
  {
    id: 'ganggang-sullae',
    name: '강강술래',
    category: '국가무형문화재',
    number: '제8호',
    region: '전라남도 해남·진도',
    designatedAt: '1966년 2월 15일',
    holders: ['박양애', '이길주'],
    shortDesc: '여성들이 손을 잡고 원을 그리며 추는 전통 집단 무용',
    description: `강강술래는 주로 전라남도 해남과 진도 지방에서 전승되어 온 전통 여성 집단 무용입니다.\n\n음력 8월 한가위 밤에 수십 명의 여성들이 손을 잡고 원을 이루어 '강강술래'라는 후렴구를 부르며 춤을 춥니다. 풍요로운 수확과 마을의 화합을 기원하는 의미를 담고 있으며, 2009년 유네스코 인류무형문화유산에 등재되었습니다.`,
    videoSrc: '/videos/ganggang-sullae.mp4',
    thumbnail: '/thumbnails/ganggang-sullae.jpg',
    likes: 342,
  },
  {
    id: 'pansori',
    name: '판소리',
    category: '국가무형문화재',
    number: '제5호',
    region: '전국',
    designatedAt: '1964년 12월 24일',
    holders: ['성우향', '남해성', '송순섭'],
    shortDesc: '소리꾼이 고수의 북장단에 맞춰 이야기를 노래하는 전통 음악',
    description: `판소리는 한 명의 소리꾼이 고수의 북장단에 맞추어 노래(창)와 말(아니리), 몸짓(너름새)으로 긴 이야기를 엮어가는 우리나라 고유의 음악 형식입니다.\n\n춘향가·심청가·흥보가·수궁가·적벽가 다섯 마당이 전해집니다. 2003년 유네스코 인류무형문화유산에 등재되었습니다.`,
    videoSrc: '/videos/pansori.mp4',
    thumbnail: '/thumbnails/pansori.jpg',
    likes: 518,
  },
  {
    id: 'hahoetal',
    name: '하회별신굿탈놀이',
    category: '국가무형문화재',
    number: '제69호',
    region: '경상북도 안동',
    designatedAt: '1980년 11월 17일',
    holders: ['류한국', '이창희'],
    shortDesc: '안동 하회마을의 탈춤, 서민의 해학과 풍자를 담은 놀이',
    description: `하회별신굿탈놀이는 경상북도 안동시 풍천면 하회마을에서 전승되어 온 탈놀이입니다.\n\n고려 중기부터 행해진 것으로 추정되며, 마을의 안녕과 풍요를 기원하는 별신굿 과정에서 공연되었습니다. 양반·선비·중·각시·이매·백정 등 다양한 탈이 등장하여 봉건적 신분 사회에 대한 서민의 해학과 풍자를 담고 있습니다.`,
    videoSrc: '/videos/hahoetal.mp4',
    thumbnail: '/thumbnails/hahoetal.jpg',
    likes: 287,
  },
]
