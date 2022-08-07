import { FixtureFactory } from 'interface-forge'
import path from 'path'
import { WP_Post_Comment_Status_Name, WP_Post_Type_Name } from 'wp-types'

import { POST_STATUS_MAP } from '../../src/constants'
import { WPPost } from '../../src/types'
import {
	contentRendered,
	fakeBase,
	fakeNumber,
	fakeUrl,
	randomWords,
	recentDate,
} from '../util'

const fixtureDir = path.resolve(__dirname, '..', '..')

export const WPPostFactory = new FixtureFactory<WPPost>(
	() => ({
		...fakeBase(),
		author: fakeNumber(12),
		categories: [],
		comment_status: WP_Post_Comment_Status_Name.open,
		content: contentRendered,
		date_gmt: recentDate(),
		date: recentDate(),
		excerpt: contentRendered,
		featured_media: fakeNumber(123),
		format: 'standard',
		guid: fakeUrl(),
		menu_order: fakeNumber(20),
		modified_gmt: recentDate(),
		modified: recentDate(),
		ping_status: WP_Post_Comment_Status_Name.open,
		status: FixtureFactory.sample(POST_STATUS_MAP),
		sticky: false,
		tags: [],
		template: 'default.php',
		title: { rendered: randomWords() },
		type: WP_Post_Type_Name.post,
		yoastHead: `<meta title="${randomWords()}" />`,
	}),
	undefined,
	fixtureDir,
)
