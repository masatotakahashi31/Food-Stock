//ページタイトルなどのメタデータを定義するための型をNext.jsから読み込み
import type {Metadata} from 'next'
//ページ遷移を高速に行うためのLinkコンポーネントを読み込み
import Link from 'next/link'

//アプリ全体のメタデータを定義し公開
export const metadata: Metadata = {
  //ブラウザのタブなどに表示されるタイトル
  title: '冷蔵庫・買い物リスト一元管理アプリ',
  //アプリの説明文
  description: '冷蔵庫・買い物リスト一元管理アプリ',
}

//全画面共通のレイアウトを構築するメイン関数を定義して公開
export default function RootLayout({
  //各ページ（/fridgeなど）のコンテンツを受け取る引数
  children,
}: {
  //childrenがReactの描画可能な要素であることを指定
  children: React.ReactNode
}) {
  return(
    <html lang='ja'>
      <body>
        <header>
          <h1>冷蔵庫・買い物リスト一元管理アプリ</h1>
        </header>
        <main>
          {/* 各ページのコンテンツ（page.tsxの中身）がここに挿入されます。 */}
          {children}
        </main>
        {/* ナビゲーション（メニュー）の領域を定義 */}
        <nav>
          {/* 順序のないリストを作成 */}
          <ul>
            {/* リストの項目を作成 */}
            <li>
              {/* 冷蔵庫一覧画面（/fridge）へのリンクを作成 */}
              <Link href="/fridge">冷蔵庫</Link>
            </li>
            <li>
              {/* お買い物一覧画面（/shopping）へのリンクを作成 */}
              <Link href="/shopping">お買い物リスト</Link>
            </li>
          </ul>
        </nav>
      </body>
    </html>
  )
}