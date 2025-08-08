<script lang="ts">
	let { children, href, external = false, ...rest } = $props();
</script>

<a {href} {...rest} rel="noopener noreferrer" target="_blank">
	{@render children?.()}
</a>
