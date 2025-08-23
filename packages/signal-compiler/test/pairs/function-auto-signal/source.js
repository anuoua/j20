const $useClip = ({ x: $x, y: $y, ...$rest }) => {
    return {
        $x,
    }
}
const $useCount = () => $k;
function $useClip2({ x: $x, y: $y, ...$rest }) {
    return {
        $x,
    }
}
const $useClip3 = ($x, $y) => {};
const { k: $k } = $useClip3($a + 1, $b);
const $pg = $usePagination({
    ...$a
});