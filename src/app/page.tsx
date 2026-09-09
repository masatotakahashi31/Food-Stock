import{redirect} from 'next/navigation' //Next.js標準機能（別URLへ飛ばす関数）読み込み

export default function Home(){
  redirect('/fridge')  // アクセスされた瞬間、強制的に '/fridge' へ移動させる
}