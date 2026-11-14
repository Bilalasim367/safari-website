import { revalidatePath } from "next/cache"

/**
 * Invalidate the cached storefront so dashboard changes appear immediately.
 * The homepage is `revalidate = 300`, so without this an edit could take up to
 * 5 minutes to show up.
 *
 * `layout` scope also refreshes the header/footer content rendered by the root
 * layout on every page, and the sidebar on /collections.
 */
export function revalidateHomepage() {
  revalidatePath("/")
}

export function revalidateSiteChrome() {
  // Root layout + every page that renders Header/Footer.
  revalidatePath("/", "layout")
}

export function revalidateCollectionsPage() {
  revalidatePath("/collections")
}
