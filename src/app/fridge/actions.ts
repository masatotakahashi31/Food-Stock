// ファイル内に書かれた関数が「サーバー側（裏側）でのみ実行される」ことをNext.jsに宣言
"use server"

// データベースを操作するためのPrismaクライアントを読み込み
import {prisma} from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
//処理が終わった後に別の画面へ強制的に移動させるための関数を読み込み
import {redirect} from 'next/navigation'
import { text } from 'stream/consumers'

//フォームから送られてきたデータ（formData）を受け取る非同期関数を定義し、外部から呼び出せるよう公開（export
export async function addStock(formData: FormData){
    
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    // ① 食材（Food）とカテゴリに関するデータの準備・登録
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    
    // フォームから送られたカテゴリIDを数値にして取得
    const categoryId = Number(formData.get('categoryId'))
    // 食材名を文字列として取得
    const foodName = formData.get('foodName') as string

    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    // ② 在庫（Stock）に関するデータの準備・登録
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

    // 数量を数値にして取得
    const quantity = Number(formData.get('quantity'))

    // フォームから送られた消費期限のデータを、まずは文字列（例: "2026-09-08" や 空文字 ""）として変数に保存
    const expirationDateString = formData.get('expirationDate') as string
    // 「もし入力されていれば、文字列を日付データ（Date）に変換する。もし空っぽなら null にする」という条件分岐を行い、結果を変数に保存
    const expirationDate = expirationDateString ? new Date(expirationDateString) : null

        // フォームから入力された「購入日時(purchaseDate)」を文字列として取り出し、変数 purchaseDateString に入れ
    const purchaseDateString = formData.get('purchaseDate') as string
    // もし日付が入力されていれば Date型（日付データ）に変換し、未入力なら現在の日時（今日・今の時間）が自動的に
    const purchaseDate = purchaseDateString ? new Date(purchaseDateString): new Date()

    // StockForm.tsx）の <input name="memo" /> で入力された文字を引っ張ってきています
    const memoString = formData.get('memo') as string
    // 「条件演算子（三項演算子）」という書き方
    // もし memoString に何か文字が入っていたら、そのままその文字を使う
    // 空っぽ（未入力）だったら、強制的に null（データなし）に変換
    const memo = memoString ? memoString : null

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return { success: false, error: "カテゴリを選択してください" }
    }
    if (!foodName || foodName.trim() === '') {
        return { success: false, error: "食材名を入力してください" }
    }
    if (foodName.length > 100) {
        return { success: false, error: "食材名は100文字以内で入力してください" }
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
        return { success: false, error: "数量は1以上の整数で入力してください" }
    }

        // ===== 新しい食材名で upsert（あれば更新、なければ作成）を実行する処理 =====
 try{   
        await prisma.$transaction(async (tx) => {
        const food = await tx.food.upsert({
        // 探すための目印（条件）：入力された食材名（foodName）が、すでにデータベースに登録されているか探します
        where: {foodName: foodName},
        // もし既に見つかった場合】：そのデータのカテゴリIDを、今回選ばれた新しいカテゴリIDに上書き更新
        update: {categoryId: categoryId},
        // 【もし見つからなかった場合（新規の食材だった場合）】：入力された食材名とカテゴリIDをセットにして、新しくデータベースに登録
        create: {
            foodName: foodName,
            categoryId: categoryId,
        }
    })

    // 最後に、stock（在庫）テーブルへの登録処理を開始
    // 左側の stockQuantity は、データベースで決めた列の名前
    // 右側の quantity は、画面から受け取って作った変数の名前
    await tx.stock.create({
        // 登録するデータを指定
        data: {
            // 上の処理で「使い回した既存のID」または「新しく作成したID」のどちらかが入っている food.id を指定
            foodId: food.id,
            // 数量と現在の日時を指定
            stockQuantity: quantity,
            purchaseDate,
            // 日付が入力されていればその日付が、未入力なら null（空っぽ）がデータベースに保存
            expirationDate: expirationDate,
            memo: memo,
        }
    })
}) 
}catch(error){
    console.log(error)
    return{success: false, error: "在庫の追加に失敗しました"}
}

    revalidatePath('/fridge')
    redirect('/fridge')
 }
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ③ 削除機能
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

// この関数を呼び出すときに、「必ず数字（number）のIDを一つ渡し
export async function deleteStockById(id: number) {
    if (!Number.isInteger(id) || id <= 0) {
        return { success: false, error: "不正なIDです" }
    }

    try {
        await prisma.stock.delete({ where: { id } })
        revalidatePath('/fridge')
        return { success: true }
    } catch (error) {
        console.log("削除エラー", error)
        return { success: false, error: "削除に失敗しました" }
    }
}

// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ④ 更新（編集）機能
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

// フォームから送られてきたデータ（formData）を受け取って、在庫を更新する関数
export async function updateStock(formData: FormData) {
    const id = Number(formData.get('id'))
    const stockQuantity = Number(formData.get('quantity'))
    const categoryId = Number(formData.get('categoryId'))
    const foodName = formData.get('foodName') as string

    const memoString = formData.get('memo') as string
    const memo = memoString ? memoString : null

    const expirationDateString = formData.get('expirationDate') as string
    const expirationDate = expirationDateString ? new Date(expirationDateString) : null

    const purchaseDateString = formData.get('purchaseDate') as string
    const purchaseDate = purchaseDateString ? new Date(purchaseDateString) : new Date()

    if (!Number.isInteger(id) || id <= 0) {
        return { success: false, error: "不正なIDです" }
    }
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return { success: false, error: "カテゴリを選択してください" }
    }
    if (!foodName || foodName.trim() === '') {
        return { success: false, error: "食材名を入力してください" }
    }
    if (foodName.length > 100) {
        return { success: false, error: "食材名は100文字以内で入力してください" }
    }
    if (!Number.isInteger(stockQuantity) || stockQuantity < 1) {
        return { success: false, error: "数量は1以上の整数で入力してください" }
    }
    if (expirationDate && isNaN(expirationDate.getTime())) {
        return { success: false, error: "消費期限の形式が正しくありません" }
    }
    if (isNaN(purchaseDate.getTime())) {
        return { success: false, error: "購入日の形式が正しくありません" }
    }
    if (memo && memo.length > 255) {
        return { success: false, error: "メモは255文字以内で入力してください" }
    }

    let oldFoodId: number | undefined
    let newFoodId: number | undefined

    try {
        const oldStock = await prisma.stock.findUnique({
            where: { id },
            select: { foodId: true },
        })
        oldFoodId = oldStock?.foodId

        newFoodId = await prisma.$transaction(async (tx) => {
            const food = await tx.food.upsert({
                where: { foodName },
                update: { categoryId },
                create: { foodName, categoryId },
            })

            await tx.stock.update({
                where: { id },
                data: { foodId: food.id, stockQuantity, expirationDate, purchaseDate, memo },
            })

            return food.id
        })
    } catch (error) {
        console.log(error)
        return { success: false, error: "更新に失敗しました" }
    }

    // 古い食品マスタの掃除(他で使われていれば失敗するが、それは正常なので無視)
    if (oldFoodId !== undefined && oldFoodId !== newFoodId) {
        try {
            await prisma.food.delete({ where: { id: oldFoodId } })
        } catch (error) {
            console.log("古い食品マスタは他で使用中のため残しました", error)   // ★ 空だった catch にログを追加
        }
    }

    revalidatePath('/fridge')   // ★ 追加
    redirect('/fridge')         // ★ try の外
}