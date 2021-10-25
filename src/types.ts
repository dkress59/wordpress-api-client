import { WPPost } from 'wordpress-api-client'

interface PostFields {
	coverImage: string
	sidebarOptions: {
		sidebar_id: number
		layout: 'a' | 'b' | 'c'
	}
}

export type CustomPost = WPPost<PostFields>

interface ProductFields {
	serialNumber: string
	priceInCents: number
}

export type WPProduct = WPPost<ProductFields>

export interface WPMenu {
	primary: WPMenuItem[]
	footer: WPMenuItem[]
	social: WPMenuItem[]
}

interface WPMenuItem {
	attr_title: string
	classes: string[]
	ID: number
	menu_order: number
	menu_item_parent: string
	object: 'page' | 'post'
	type: 'post_type' | 'post_type_archive'
	url: string
	target: '' | '_blank'
	title: string
}
