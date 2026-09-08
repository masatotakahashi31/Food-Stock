// ファイル内に書かれた関数が「サーバー側（裏側）でのみ実行される」ことをNext.jsに宣言
"use server"

// データベースを操作するためのPrismaクライアントを読み込み
import {prisma} from '@/lib/prisma'
//処理が終わった後に別の画面へ強制的に移動させるための関数を読み込み
import {redirect} from 'next/navigation'

//フォームから送られてきたデータ（formData）を受け取る非同期関数を定義し、外部から呼び出せるよう公開（export
export async function addStock(formData: FormData){
    // フォームから送られたカテゴリIDを数値にして取得
    const categoryId = Number(formData.get('categoryId'))
    // 食材名を文字列として取得
    const foodName = formData.get('foodName') as string
    // 数量を数値にして取得
    const quantity = Number(formData.get('quantity'))

    // フォームから送られた消費期限のデータを、まずは文字列（例: "2026-09-08" や 空文字 ""）として変数に保存
    const expirationDateString = formData.get('expirationDate') as string
    // 「もし入力されていれば、文字列を日付データ（Date）に変換する。もし空っぽなら null にする」という条件分岐を行い、結果を変数に保存
    const expirationDate = expirationDateString ? new Date(expirationDateString) : null

    // 食品マスタ）テーブルの中から、条件に合う最初の1件を探して変数 food に入れます。後で中身を書き換える可能性があるため、const ではなく let で宣言
    let food = await prisma.food.findFirst({
        // 探す条件として「入力された食材名と完全に一致するデータ」を指定
        where: {foodName: foodName}
    })

    // もし該当する食品データが見つかった（既に登録されていた）場合の分岐
    if (food){
        // 見つかった食品に紐付いているカテゴリIDと、今回画面で選択されたカテゴリIDが一致しない（別のカテゴリが選ばれた）場合の分岐
        if (food.categoryId !== categoryId){
            // Prismaの update 機能を使ってデータを上書きし、その結果で変数 food を書き換え
            food = await prisma.food.update({
                // 上書きする対象として、見つかった食品データのIDを指定
                where: {id: food.id},
                // 変更する内容として、カテゴリIDを「今回新しく画面で選ばれたカテゴリID」に書き換え
                data: {categoryId: categoryId},
            })
        // カテゴリ不一致の分岐を閉じます。（カテゴリが一致した場合は何もせず、見つかった food のデータをそのまま使い回します
        }
    // もし該当する食品データが見つからなかった（新規の食材だった）場合の分岐
    } else {
        // 新しい食品データを food テーブルに登録し、その結果を変数 food に上書き
        food = await prisma.food.create({
            // 入力された食材名と選択されたカテゴリIDを登録データとして指定
            data: {
                foodName: foodName,
                categoryId: categoryId,
            }
        // 登録処理を終了
        })
    // 見つからなかった場合の分岐を閉じ
    }

    // 最後に、stock（在庫）テーブルへの登録処理を開始
    await prisma.stock.create({
        // 登録するデータを指定
        data: {
            // 上の処理で「使い回した既存のID」または「新しく作成したID」のどちらかが入っている food.id を指定
            foodId: food.id,
            // 数量と現在の日時を指定
            stockQuantity: quantity,
            purchaseDate: new Date(),
            // 日付が入力されていればその日付が、未入力なら null（空っぽ）がデータベースに保存
            expirationDate: expirationDate,
        }
    })

    // すべて完了したら冷蔵庫一覧画面へ移動
    redirect('/fridge')
}