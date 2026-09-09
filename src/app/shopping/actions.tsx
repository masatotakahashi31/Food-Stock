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

export async function purchaseShoppingItem(id: number) {
    await prisma.shopping.update({
        where: {id: id},
        data: {isPurchased: true}
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