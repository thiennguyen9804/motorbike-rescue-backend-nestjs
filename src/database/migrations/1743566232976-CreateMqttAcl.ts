import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMqttAcl1743566232976 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "mqtt_acl" (
                "id" SERIAL PRIMARY KEY,
                "topic" VARCHAR NOT NULL,
                "rw" INT NOT NULL,
                "deviceId" INT NOT NULL,
                CONSTRAINT "fk_mqtt_acl_device" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE CASCADE
            );
        `);

    // Tạo function để tự động thêm mqtt_acl
    await queryRunner.query(`
            CREATE FUNCTION create_mqtt_acl_for_device() RETURNS TRIGGER AS $$
            BEGIN
                INSERT INTO mqtt_acl (topic, rw, "deviceId") VALUES
                (concat('device/', NEW.id), 4, NEW.id),
                (concat('device/', NEW.id), 1, NEW.id),
                (concat('device/', NEW.id, '/update'), 2, NEW.id);

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

    // Tạo trigger cho mqtt_acl
    await queryRunner.query(`
            CREATE TRIGGER trigger_create_mqtt_acl
            AFTER INSERT ON device
            FOR EACH ROW
            EXECUTE FUNCTION create_mqtt_acl_for_device();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger first
    await queryRunner.query(`
            DROP TRIGGER IF EXISTS trigger_create_mqtt_acl ON device;
        `);

    // Drop function
    await queryRunner.query(`
            DROP FUNCTION IF EXISTS create_mqtt_acl_for_device();
        `);

    // Drop table
    await queryRunner.query(`
            DROP TABLE IF EXISTS mqtt_acl;
        `);
  }
}
