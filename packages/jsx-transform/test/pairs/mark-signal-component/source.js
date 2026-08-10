const el = (
  <Widget
    Header={({ msg: $msg }) => $msg}
    Row={function ({ id: $id }) { return $id; }}
    Plain={({ msg }) => msg}
    onClick={({ e: $e }) => $e}
    title="str"
    {...{ x: ($x) => $x }}
  />
);
