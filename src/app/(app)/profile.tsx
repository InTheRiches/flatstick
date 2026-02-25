import {ProfileScreen} from "@/screens/app/ProfileScreen";
import {useEquipment, useUser} from "@/context";

export default function Profile() {
    const { userProfile } = useUser()
    const { selectedPutter, selectedGrip } = useEquipment()

    return <ProfileScreen userProfile={userProfile ?? undefined}  selectedPutter={selectedPutter ?? undefined} selectedGrip={selectedGrip ?? undefined} />
}
