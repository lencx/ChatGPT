import Icon from "@ant-design/icons";
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

interface IconProps {
  onClick: () => void;
}

export default function SplitIcon(props: Partial<CustomIconComponentProps & IconProps>) {
  return <Icon
    {...props}
    component={() => (
      <svg className="chatico" viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
        <path d="M252.068571 906.496h520.283429c89.581714 0 134.144-44.562286 134.144-132.845714V250.331429c0-88.283429-44.562286-132.845714-134.144-132.845715H252.068571c-89.142857 0-134.582857 44.141714-134.582857 132.845715V773.668571c0 88.704 45.44 132.845714 134.582857 132.845715z m1.28-68.992c-42.843429 0-66.852571-22.710857-66.852571-67.291429V253.805714c0-44.580571 24.009143-67.291429 66.852571-67.291428h222.866286v651.008z m517.723429-651.008c42.422857 0 66.432 22.710857 66.432 67.291429V770.194286c0 44.580571-24.009143 67.291429-66.432 67.291428H548.205714V186.496z" />
      </svg>
    )}
  />
}
