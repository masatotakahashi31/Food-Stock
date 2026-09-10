"use server"

import {prisma} from '@/lib/prisma'
import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'

export async function deleteShoppingItem(id: number) {
    await prisma.shopping.delete({
        where: {id: id}
    })
    revalidatePath('/shopping')
}

export async function toggleShoppingItem(id: number, isPurchased: boolean) {
    await prisma.shopping.update({
        where: {id: id},
        data: {isPurchased: isPurchased}
    })
    revalidatePath('/shopping')
}

export async function addShoppingItem(formData: FormData) {
    const categoryId = Number(formData.get('categoryId'))
    const itemName = formData.get('itemName') as string
    const quantity = Number(formData.get('quantity'))

    // データベースから、未購入（isPurchased: false）かつ「入力された品名」と完全に一致するデータを探します
    const existingItem = await prisma.shopping.findFirst({
        where: {
            itemName: itemName,
            isPurchased: false,
        }
    })

    // もし該当するお買い物データが見つかった（既にリストに登録されていた）場合の分岐
    if (existingItem) {
        
        // Prismaの update 機能を使って、すでにあるデータを上書きします
        await prisma.shopping.update({
            // 上書きする対象として、見つかったお買い物データのIDを指定
            where: { id: existingItem.id },
            // 変更する内容の指定
            data: {
                // カテゴリIDを「今回新しく画面で選ばれたカテゴリID」で上書き
                categoryId: categoryId,
                // 数量は、「すでに入っている数量」に「今回入力された数量」を足し算して合体させます！
                quantity: existingItem.quantity + quantity,
            },
        })
        
    // もし該当するお買い物データが見つからなかった（リストに無い新しい品名だった）場合の分岐
    } else {
        
        // 新しいお買い物データを Shopping テーブルに登録します
        await prisma.shopping.create({
            data: {
                categoryId: categoryId,
                itemName: itemName,
                quantity: quantity,
                addType: 'manual', // 手入力の目印
            }
        })
        
    // 見つからなかった場合の分岐を閉じます
    }

    // 保存や更新が終わったら、お買い物リスト一覧画面に強制移動させます
    redirect('/shopping')
}

export async function editShoppingItem(id: number, formData: FormData) {
    const categoryId = Number(formData.get('categoryId'))
    const itemName = formData.get('itemName') as string
    const quantity = Number(formData.get('quantity'))

    await prisma.shopping.update({
        where: {id: id},
        data: {
            categoryId: categoryId,
            itemName: itemName,
            quantity: quantity,
        }
    })
    revalidatePath('/shopping')
    redirect('/shopping')
}

// データベースを操作する処理　ボタンから「カテゴリID」「名前」「数量」の3つのデータを受け取ります
export async function quickAddShoppingItem(categoryId: number, itemName: string, quantity: number) {
    // 「既存のデータ（existingItem）」という箱を用意し、Prisma（データベース操作ツール）を使って、条件に合うデータを「1件だけ探し
    const existingItem = await prisma.shopping.findFirst({
        // 探す条件（where）です。「ボタンから受け取った品名と同じ名前」かつ「まだ買ってない（isPurchased: false）」データを探します
        where: {
            itemName: itemName,
            isPurchased: false,
        }
    })

    // 「もし条件に合うデータが既に見つかったら？」の分岐
    if (existingItem) {
        // Prismaを使って、すでにあるデータを「上書き
        await prisma.shopping.update({
            // 上書きする相手は、「さっき見つけたデータのID」と指定
            where: { id: existingItem.id },
            // 変更する中身（data）です。元々入っていた数量（existingItem.quantity）に、今回追加したい数量（quantity）を足し算して保存
            data: {
                quantity: existingItem.quantity + quantity,
            },
        })
        // もしデータが見つからなかったら（リストにまだ無い新しい品物だったら）？」の分岐
    } else {
        // Prismaを使って、新しいデータを「新規作成
        await prisma.shopping.create({
            // 保存する中身です。受け取ったデータをそのまま入れつつ、addType に「在庫から追加」という目印の文字をセットして保存
            data: {
                categoryId: categoryId,
                itemName: itemName,
                quantity: quantity,
                addType: '在庫から追加', // ★ どこから追加されたかの記録！
            }
        })
    }

    // 更新が終わったら、買い物リストと在庫画面（冷蔵庫）のキャッシュを捨てて最新にする
    revalidatePath('/shopping')
    revalidatePath('/fridge') 
}

// ★ 購入済みアイテムを冷蔵庫（在庫）へ移行する関数
export async function transferToFridge(shoppingId: number) {
    // 1. お買い物リストのデータを取得（カテゴリの isFood も一緒に取得する）
    const item = await prisma.shopping.findUnique({
        where: { id: shoppingId },
        include: { category: true } // ★リレーション先のカテゴリ情報も引き出す
    })

    // 安全装置（エラーチェック）
    if (!item) throw new Error("データが見つかりません")
    if (!item.isPurchased) throw new Error("まだ購入されていません")
    
    // ★ 要件クリア：非食品（isFood = false）はバックエンドでもしっかり弾く！
    if (!item.category.isFood) {
        throw new Error("食品ではないため冷蔵庫に移行できません")
    }

    // 2. 食材マスタ（Food）を検索 or 新規作成（Find or Create）
    // まずは同じ名前・同じカテゴリの食材マスタがすでに存在するか探す
    let food = await prisma.food.findFirst({
        where: {
            foodName: item.itemName,
            categoryId: item.categoryId,
        }
    })

    // マスタに無ければ、裏側でこっそり自動作成する
    if (!food) {
        food = await prisma.food.create({
            data: {
                foodName: item.itemName,
                categoryId: item.categoryId,
            }
        })
    }

    // 3. 取得（または作成）した食材マスタのIDを使って、在庫（Stock）に登録
    await prisma.stock.create({
        data: {
            foodId: food.id,
            stockQuantity: item.quantity,
            purchaseDate: new Date(), // 購入日は「今日」として登録
        }
    })

    // 4. 移行完了後、お買い物リストからは削除する（移行＝移動のため）
    await prisma.shopping.delete({
        where: { id: shoppingId }
    })

    // キャッシュをクリアして画面を最新化
    revalidatePath('/shopping')
    revalidatePath('/fridge')
}

//constで良い理由
// 新規のお買い物だった場合（else の中）
// ビフォー： existingItem ＝ 空っぽ（null）
// 処理： データベースに新しく「牛乳」を登録（create）します。データベースの中には新しいID付きで牛乳が保存されます。
// アフター： existingItem ＝ 空っぽ（null）のまま！（箱の中身は詰め直していません）
// 登録処理が終わった次の行は、redirect('/shopping') （一覧画面へ戻る） だからです。
// 「新しく発行された牛乳のID」を使う用事がもう一切ないので、わざわざ箱に最新のデータを詰め直す必要がなく、空っぽのまま放置して画面を移動してOKなのです。

// 探す: リストの中に、まだ買っていない同じ名前の品物があるか探す。

// あった場合: 新しく行を追加するのではなく、すでにあるデータの「数量」を足し算して合体させます。（例：すでに「にんじん1本」と書いてあるメモに、さらに2本追加されたら「にんじん3本」に書き換える）

// なかった場合: 新しい品物として、リストに新規登録します。