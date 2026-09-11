"use client"

// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ① インポート（必要な部品の読み込み）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
import {useState} from 'react'
import {deleteStockById} from '@/app/fridge/actions'
import Link from 'next/link'
import QuickAddButton from './QuickAddButton'
import '@/app/globals.css';


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ② 型定義（データルールの設定）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// 1. カテゴリの型
type Category = {
  id: number
  categoryName: string
}

// 2. 食材の型（中にカテゴリを含む）
type Food = {
  foodName: string
  category: Category
}

// 3. 在庫の型（中に食材を含む）
type Stock = {
  id: number
  stockQuantity: number
  expirationDate: Date | null
  purchaseDate: Date | null
  memo: string | null
  food: Food
}

// 4. Propsの型（Stock の配列）
// initialStocks という名前の箱には、上で作った Stock 型の「配列（[]＝複数データ）」が入る
type Props = {
  initialStocks: Stock[]
}


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ③ メインコンポーネント（画面の描画と操作）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// StockList部品の本体。親から送られてきた箱（initialStocks）をルール(Props)通りに受け取り
export default function StockList({initialStocks}: Props){
    
    // 親からもらった最初のデータ(initialStocks)を、自分のメモ帳(stocks)に丸写し
    // setstocksはこのメモ帳を書き換えるための専用の関数
    const [stocks, setstocks] = useState(initialStocks)

    // ----------------------------------------------------
    // アクション：消費期限からハイライト色を計算する
    // ----------------------------------------------------
    // 消費期限（expirationDate）」を受け取って、それに合わせた「色の設定（スタイル）」を返す関数
    const getHighlightStyle = (expirationDate: Date | null) => {
        // 消費期限が登録されていなければ（null)なら、何も色をつけない
        if (!expirationDate) return {}

        // 現在の「日付と時間（例：2026年9月10日 15:33）」を取得
        const today = new Date()
        // 時間を「0時0分0秒0ミリ秒」にリセットします。これをしないと、「今日の夕方」と「今日の朝」の比較でズレが生じてしまうため、純粋に「日付」で判定
        today.setHours(0, 0, 0, 0)

        // 食材の「消費期限」も日付データに変換し、時間を「0時0分0秒0ミリ秒」にリセット
        const expDate = new Date(expirationDate)
        expDate.setHours(0, 0, 0, 0)

        // 日数の差を計算
        // .getTime() を使うと、日付を「1970年から何ミリ秒経ったか」というとんでもなく大きな数字に変換できます。その数字同士を引き算して、「2つの日付の差（ミリ秒）」を出します
        const diffTime = expDate.getTime() - today.getTime()
        // さっき計算したミリ秒を、「日数」に直します。
        // （1000ミリ秒 × 60秒 × 60分 × 24時間 ＝ 1日）。Math.ceil は端数が出た時のための切り上げ処理
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // ▼ 日数によって色を変える
        // もし計算した日数が0より小さければ（マイナスなら）、すでに期限を過ぎているので、背景を薄い赤、文字を
        if (diffDays < 0) {
            // すでに期限切れ：薄い赤色の背景と、濃い赤の文字
            return { backgroundColor: '#ffe4e6', color: '#e11d48', padding: '10px', borderRadius: '5px' }
        // 2日以内：薄い黄色の背景と、濃いオレンジの文字
        } else if (diffDays <= 2) {
            return { backgroundColor: '#fef3c7', color: '#d97706', padding: '10px', borderRadius: '5px' }
        }

        // 上のどちらにも当てはまらない（期限まで3日以上ある）場合は、色を変えず、少しだけ余白（padding）をつける設定
        return { padding: '10px' } 
    }

    // ----------------------------------------------------
    // アクション：削除ボタンが押された時の処理
    // ----------------------------------------------------
    // 削除ボタンが押された時に動く関数（引数として、押された項目の id を受け取り
    const handleDelete = async (id: number) =>{
        // 今のメモ帳(stocks)の中から、「押されたidとは『違う(!==)』データ」だけを残した新しいリストを作り
        // 押されたデータが除外されたリスト
        const newStocks = stocks.filter((stock) => stock.id !== id)
        // (setstocks)を使って、メモ帳をさっき作った「新しいリスト」に書き換え
        setstocks(newStocks)
        // 裏側の処理(deleteStockById)を呼び出し、データベースからもこっそり削除します。
        await deleteStockById(id)
    }


    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    // ④ 画面の表示（HTML / UI部分）
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    return(
        // ★ここがポイント1： <ul> をやめて <table> で全体を囲みます。
        // className="w-full" で、画面の横幅いっぱいに表を広げます。
        <table className="w-full text-left">
            
            {/* ★ここがポイント2： 表の見出し（ヘッダー）を先に作ります */}
            <thead>
                <tr className="border-b"> 
                    <th className="p-2 w-4/12">食材</th>
                    <th className="p-2 w-2/12">カテゴリー</th>
                    <th className="p-2 w-1/12">数量</th>
                    <th className="p-2 w-4/12">期限 / 購入日 / メモ</th>
                    <th className="p-2 w-1/12">操作</th>
                </tr>
            </thead>

            {/*  ここからデータの出力（tbody）を始めます */}
            <tbody
>
                {stocks.map((stock) => (
                    //<tr> (テーブルの行) 
                    <tr 
                        key={stock.id}
                        // ハイライト機能は、行全体に当てはめ
                        style={getHighlightStyle(stock.expirationDate)}
                        className="border-b"
                    >
                        {/* 1マス目：食材名 */}
                        <td className="p-4 font-bold">{stock.food.foodName}</td>
                        
                        {/* 2マス目：カテゴリー */}
                        <td className="p-4">{stock.food.category.categoryName}</td>
                        
                        {/* 3マス目：数量 */}
                        <td className="p-4">{stock.stockQuantity}</td>
                        
                        {/* 4マス目：期限やメモなどの細かい情報 */}
                        <td className="p-4 text-sm text-gray-600">
                            {stock.expirationDate && (
                                <span>期限: {stock.expirationDate.toLocaleDateString('ja-JP')} </span>
                            )}
                            {stock.purchaseDate && (
                                <span> / 購入: {stock.purchaseDate.toLocaleDateString('ja-JP')} </span>
                            )}
                            {stock.memo && (
                                <span> / {stock.memo}</span>
                            )}
                        </td>
                        
                        {/* 5マス目：操作ボタンたち */}
                        <td className="p-2">
                            {/* flex を使うと、ボタンが横に綺麗に並びます */}
                            <div className="flex gap-2 items-center">
                                <QuickAddButton 
                                    categoryId={stock.food.category.id} 
                                    itemName={stock.food.foodName} 
                                    quantity={1} 
                                />
                                
                                {/* px-2 py-1 (内側の余白) と rounded (角丸) を足すとさらにボタンらしくなりますよ */}
                                <Link
                                    href={`/fridge/${stock.id}/edit`}
                                    className="text-blue-500 bg-blue-200 hover:underline w-15 text-center py-2 rounded"
                                >
                                    編集
                                </Link>
                                
                                <button
                                    onClick={() => handleDelete(stock.id)}
                                    className="text-red-500 bg-red-200 hover:underline w-15 text-center py-2 rounded"
                                >
                                    削除
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}